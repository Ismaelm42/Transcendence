/**
 * enventManager.js file: server-side websocket workflow manager
 * Functions to set up the socket event listeners/handlers when connection is established
 */
import { extractUserFromToken } from "../../auth/token.js";
import { handleJoinGame, handlePlayerInput, handleLeaveGame, handlePlayerInfo, handleClientReady, handleRestartGame, handleGamesList, handleGetReadyState, handlePauseGame, handleResumeGame } from "./messageManager.js";
export const gamesList = new Map();
export const clients = new Map();

/**
 *	The client's auth token is extracted from cookies
 *	The user is authenticated (same flow as your chat system)
 *	The connection is stored in the clients Map for later reference
 */
export async function registerGameClient(request, connection) {
	console.log("STEPPED INTO -> registerGameClient");
	// First, extract user from cookies - as in chat logic (or as I understood it)
	const token = request.cookies.token;
	if (!token) {
		console.error("No auth token found");
		connection.send(JSON.stringify({
			type: 'ERROR',
			message: 'Authentication required'
		}));
		return (null);
	}
	const user = await extractUserFromToken(token);
	if (user && user.id) {
		console.log(`User authenticated: ${user.id}`);
		// Register and track connection
		clients.set(user.id, {
			connection,
			roomId: null
		})
		//console.log("Connection socket object of registred user:\n", clients.get(user.id).connection);
		return ({ user, connection });
	}
	else {
		console.error("Invalid user extracted from token");
		connection.send(JSON.stringify({
			type: 'ERROR',
			message: 'Invalid user authentication'
		}));
		return (null);
	}
}

/**
 * messageManager() is the manager for messages, it calls the specific handler functions
 * JOIN_GAME	Player wants to join/create a game	{ roomId: "abc123", gameMode: "1v1" }
 * PLAYER_INPUT	Player moves paddle	{ input: { up: true, down: false } }
 * LEAVE_GAME	Player quits	(no additional data)
 */
export function messageManager(client, connection) {
	try {
		setTimeout(() => {
			console.log("Sending test message to client");
			connection.send(JSON.stringify({
				type: 'SERVER_TEST',
				message: 'Testing connection'
			}));
		}, 1000);
	} catch (error) {
		console.error("Error sending test message:", error);
	}

	connection.on('message', (message) => {
		try {
			const data = JSON.parse(message.toString());
			console.log("JSON message received FRONT->BACK:\n", data);
			switch (data.type) {
				case 'JOIN_GAME':
					handleJoinGame(client, data);
					break;
				case 'CLIENT_READY':
					handleClientReady(client, data);
					break;
				case 'PLAYER_INPUT':
					handlePlayerInput(client, data);
					break;
				case 'LEAVE_GAME':
					handleLeaveGame(client);
					break;
				case 'RESTART_GAME':
					handleRestartGame(client, data);
					break;
				case 'PING':
					connection.send(JSON.stringify({ type: 'PONG' }));
					break;
				case 'GET_USER':
					handlePlayerInfo(client, data);
					break;
				case 'SHOW_GAMES':
					handleGamesList(client);
					break;
				case 'GET_READY_STATE':
					handleGetReadyState(client);
					break;
				case 'PAUSE_GAME':
					handlePauseGame(client, data);
					break;
				case 'RESUME_GAME':
					handleResumeGame(client, data);
					break;
				case 'GAME_ACTIVITY':
					handleGameActivity(client, data);
					break;
				case 'END_GAME':
					const gameSession = gamesList.get(data.gameId);
					if (gameSession)
						gameSession.endGame(gamesList, false);
					else
						console.error(`END_GAME: No game session found for id ${data.gameId}`);
					break;
				case 'INSPECT_GAMES':
					fetchGameSessionsInfo(client);
					break;
				default:
					console.log(`Unknown message type: ${data.type}`);
			}
		}
		catch (error) {
			console.error('Game message error:', error);
		}
		console.log("Updated connection event listeners:", Object.keys(connection._events));
	});
}

/**
 * handleGameDisconnect() is called when the client disconnects from the game
 * It cleans up the game session and notifies other players
 * TO DO: check if this is needed, as it is also handled with LEAVE_GAME message
 */
export function handleGameDisconnect(client, connection) {
	connection.on('close', () => {
		try {
			const { user } = client;
			const clientData = clients.get(user.id);
			if (!clientData) return;
			const gameSession = gamesList.get(clientData.roomId);
			if (!gameSession) return;

			// If game is active and remote, handle as forfeit (disconnect)
			if (gameSession.metadata.mode === 'remote' &&
				gameSession.metadata.startTime &&
				!gameSession.isFinished) {
				console.log(`Player ${user.username} disconnected from active remote game. Forfeiting...`);
				gameSession.handlePlayerDisconnect(user.id, gamesList);
			}
			else {
				// Standard cleanup for other modes or inactive games
				gameSession.removePlayer(user.id);
				if (gameSession.isEmpty() || gameSession.isFinished || gameSession.shouldCleanup)
					gamesList.delete(clientData.roomId);
			}
			// Remove client tracking
			clients.delete(user.id);
		} catch (e) {
			console.error('Error handling disconnect:', e);
		}
	});
}

/**
 * handler to be called wen connection reports an error, it sends an error message to
 * the client and handles the leave game logic if the error is critical
 */
export function handleGameError(client, connection) {
	connection.on('error', (error) => {
		const { user } = client;

		console.log(`Game error for user ${user.id}:`, error);
		try {
			connection.send(JSON.stringify({
				type: 'ERROR',
				message: 'An unexpected error occurred during gameplay'
			}));
		}
		catch (sendError) {
			console.error('Failed to send error message to client:', sendError);
		}

		if (error.critical)
			handleLeaveGame(client);
	});
}

export function handleGameActivity(client, data) {
	const { user } = client;
	const clientData = clients.get(user.id);
	const gameSession = gamesList.get(clientData.roomId);
	if (!gameSession)
		return;
	const player = gameSession.players.get(user.id);
	if (player)
		player.active = !!data.active; // true if on game-match, false otherwise

	// If game is paused and all players are active again, auto resume with countdown
	if (gameSession.isPaused && gameSession.metadata && gameSession.metadata.startTime) {
		let totalPlayers = 0;
		let activePlayers = 0;
		gameSession.players.forEach((p) => {
			totalPlayers++;
			if (p.active) activePlayers++;
		});
		if (totalPlayers > 0 && activePlayers === totalPlayers) {
			const COUNTDOWN_SECONDS = 3;
			gameSession.broadcastResponse('GAME_COUNTDOWN', {
				seconds: COUNTDOWN_SECONDS,
				reason: 'All players returned'
			});
			setTimeout(() => {
				gameSession.resumeGame(gamesList);
				gameSession.broadcastResponse('GAME_RESUMED', {
					reason: 'All players returned'
				});
			}, COUNTDOWN_SECONDS * 1000);
		}
	}
}

export async function fetchGameSessionsInfo(client) {
	const games = [];
	for (const gameSession of gamesList.values()) {
		if (!gameSession || !gameSession.metadata) continue;
		// Only include sessions where the requesting user is a participant
		const isParticipant = gameSession.players.has(client.user.id)
			|| gameSession.metadata?.playerDetails?.player1?.id === client.user.id
			|| gameSession.metadata?.playerDetails?.player2?.id === client.user.id;
		if (isParticipant) {
			games.push(gameSession.metadata);
		}
	}
	client.connection.send(JSON.stringify({
		type: 'GAMES_DETAILS',
		games: games,
		userId: client.user.id
	}));
}
