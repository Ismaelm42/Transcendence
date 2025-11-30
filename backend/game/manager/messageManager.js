/**
 * messageManager.js file: server-side handlers for websocket types of messages
 */
import GameSession from "../engine/index.js";
import { gamesList, clients } from "./eventManager.js";
import { crud } from '../../crud/crud.js';

/**
 * When a player JOINs the game
 */
export function handleJoinGame(client, data) {
	const { user, connection } = client;
	const gameMode = data.mode;
	const roomId = data.roomId || `game-${Date.now().toString(36)}`;
	const config = data.config || { scoreLimit: 5, difficulty: 'medium' };
	const secondPlayerInfo = data.player2 || null;
	// 1. Find or create the game session
	let gameSession = gamesList.get(roomId);
	if (!gameSession) {
		gameSession = new GameSession(roomId, gameMode);
		gamesList.set(roomId, gameSession);
		// Apply game configuration
		if (config) {
			if (config.scoreLimit)
				gameSession.winScore = config.scoreLimit;
			if (config.difficulty)
				gameSession.setDifficulty(config.difficulty);
			gameSession.metadata.config = {
				scoreLimit: gameSession.winScore,
				difficulty: gameSession.difficulty
			};
		}
	}
	else {
		// Existing session: if this user already belongs, reattach their connection and mark active
		const existingPlayer = gameSession.players.get(user.id);
		if (existingPlayer) {
			existingPlayer.connection = connection;
			existingPlayer.active = true;
			clients.set(user.id, { connection, roomId });
			// Send current metadata/config so client can render immediately
			connection.send(JSON.stringify({
				type: 'GAME_INIT',
				config: gameSession.getConfig(),
				metadata: gameSession.metadata
			}));
			// If the game is paused, inform the client and attempt auto-resume when everyone is active
			if (gameSession.isPaused && gameSession.metadata && gameSession.metadata.startTime) {
				try {
					connection.send(JSON.stringify({
						type: 'GAME_PAUSED',
						reason: 'Reconnected during pause',
						userId: user.id,
						maxPauseDuration: gameSession.maxPauseDuration,
						pauseStartTime: gameSession.pauseStartTime || Date.now()
					}));
				} catch { }
				// Check if all players are active now; if so, trigger countdown and resume
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
			return;
		}
	}
	// 2. Add players to the game
	// Tournament game: set both player1 and player2 from metadata
	if (data.tournamentId && data.player1 && data.player2) {
		gameSession.setPlayerDetails('player1', data.player1);
		gameSession.setPlayerDetails('player2', data.player2);
		gameSession.setTournamentId(data.tournamentId);
		gameSession.players.set(user.id, { connection, playerNumber: 'player1', ready: false });
		clients.set(user.id, { connection, roomId });
	}
	// Standard game: set this socket connected user to corresponding palyer slot
	else {
		const playerNumber = gameSession.addPlayer(user.id, connection);
		if (!playerNumber) {
			connection.send(JSON.stringify({
				type: 'ERROR',
				message: 'Game is full'
			}));
			return;
		}
		// 3. Store game player logs!
		gameSession.setPlayerDetails(playerNumber, user);
		clients.set(user.id, { connection, roomId });
		// 4. Set second playerInfo if 1v1 or 1vAI - no more connections needed
		if (secondPlayerInfo && (gameMode === '1vAI' || gameMode === '1v1'))
			gameSession.setPlayerDetails('player2', secondPlayerInfo);
	}
	// 4. Send initial game data
	connection.send(JSON.stringify({
		type: 'GAME_INIT',
		config: gameSession.getConfig(),
		metadata: gameSession.metadata
	}));
}

export function handleRestartGame(client, data) {
	const { user } = client;
	const clientData = clients.get(user.id);
	// Delete old game session if it exists
	const oldGameSession = gamesList.get(clientData?.roomId);
	if (!data.rematch) {
		if (oldGameSession)
			gamesList.delete(clientData.roomId);
		return;
	}
	if (oldGameSession)
		gamesList.delete(clientData.roomId);
	// Create a new game with same config
	const gameMode = data.mode || (oldGameSession ? oldGameSession.gameMode : '1v1');
	const roomId = `game-${Date.now().toString(36)}`;
	const config = data.config || {
		scoreLimit: oldGameSession ? oldGameSession.winScore : 5,
		difficulty: oldGameSession ? oldGameSession.difficulty : 'medium'
	};

	let player2 = null;
	if (oldGameSession && (gameMode === '1v1' || gameMode === '1vAI'))
		player2 = oldGameSession.metadata?.playerDetails?.player2 || null;
	// Call join game with new parameters
	console.log("player2:", player2);
	handleJoinGame({ user, connection: client.connection }, {
		mode: gameMode,
		roomId: roomId,
		config: config,
		player2: player2
	});
}

/**
 * When a player sends keys input (should be up/down for paddle movement)
 * Server updates the player's paddle position and this updated position is reflected in the next GAME_STATE broadcast
 */
export function handlePlayerInput(client, data) {
	const { user } = client;
	const clientData = clients.get(user.id);
	const gameSession = gamesList.get(clientData.roomId);
	if (!gameSession)
		return;
	gameSession.movePlayerPaddle(user.id, data.input, data.input.player);
}

/**
 * When a player leaves
 */
export function handleLeaveGame(client) {
	const { user } = client;
	const clientData = clients.get(user.id);

	// 1. Find and update the game session
	const gameSession = gamesList.get(clientData?.roomId);
	if (gameSession) {
		// Check for active remote game disconnect
		if (gameSession.metadata.mode === 'remote' &&
			gameSession.metadata.startTime &&
			!gameSession.isFinished) {
			gameSession.handlePlayerDisconnect(user.id, gamesList);
		}
		else {
			gameSession.removePlayer(user.id);
			// 2. End game if empty
			if (gameSession.isEmpty() || gameSession.isFinished || gameSession.shouldCleanup)
				gamesList.delete(clientData.roomId);
		}
	}
	// 3. Remove client tracking
	clients.delete(user.id);
}

export async function handlePlayerInfo(client, data) {
	let user = null;
	if (data.mode && data.mode === 'local') {
		user = {
			id: client.user.id,
			username: client.user.username,
			tournamentUsername: client.user.tournamentUsername,
			email: client.user.email,
			avatarPath: client.user.avatarPath
		};
	}
	else if (data.mode && data.mode === 'external' && data.email) {
		try {
			user = await crud.user.getUserByEmail(data.email);
			if (!user) {
				console.log(`Error: User not found for email ${data.email}`);
				user = null;
				return;
			}
		}
		catch (error) {
			console.error("Error while fetching user by email:", error);
		}
	}
	client.connection.send(JSON.stringify({
		type: 'USER_INFO',
		mode: data.mode,
		user: user
	}));
}

export function handleClientReady(client, data) {
	const { user } = client;
	const clientData = clients.get(user.id);
	const gameSession = gamesList.get(clientData.roomId);
	const COUNTDOWN_SECONDS = 3;

	if (!gameSession)
		return;
	const player = gameSession.players.get(user.id);
	if (player)
		player.ready = true;

	if (gameSession.shouldStart()) {
		const allReady = Array.from(gameSession.players.values()).every(p => p.ready);
		if (allReady && !gameSession.gameLoop) {
			gameSession.state = gameSession.resetState();
			gameSession.broadcastResponse('GAME_COUNTDOWN', { seconds: COUNTDOWN_SECONDS });
			setTimeout(() => {
				gameSession.broadcastResponse('GAME_START');
				if (!gameSession.metadata.startTime)
					gameSession.metadata.startTime = Date.now();
				setTimeout(() => {
					gameSession.startGameLoop(gamesList);
				}, 1000); // 1 second freeze after GAME_START
			}, COUNTDOWN_SECONDS * 1000); // Countdown duration
		}
	}
}

export function handleGamesList(client) {
	const games = [];
	for (const gameSession of gamesList.values()) {
		if (gameSession && gameSession.metadata && gameSession.metadata.mode === 'remote')
			games.push(gameSession.metadata);
	}
	client.connection.send(JSON.stringify({
		type: 'GAMES_LIST',
		games: games
	}));
}

export function handleGetReadyState(client) {
	const { user } = client;
	const clientData = clients.get(user.id);
	const gameSession = gamesList.get(clientData.roomId);
	if (!gameSession)
		return;
	const playerDetails = gameSession.metadata.playerDetails;
	const readyStates = {};
	gameSession.players.forEach((p, id) => {
		readyStates[p.playerNumber] = p.ready;
	});
	client.connection.send(JSON.stringify({
		type: 'READY_STATE',
		playerDetails,
		readyStates
	}));
}

export function handlePauseGame(client, data) {
	const { user } = client;
	const clientData = clients.get(user.id);
	const gameSession = gamesList.get(clientData.roomId);
	if (!gameSession)
		return;
	if (!gameSession.isPaused && gameSession.gameLoop) {
		gameSession.pauseGame();
		gameSession.pauseStartTime = Date.now();
		// Set timeout to auto-check players
		gameSession.pauseTimer = setTimeout(() => {
			gameSession.checkPlayersStatus(gamesList);
		}, gameSession.maxPauseDuration);
		// Notify or pass to client-frontside pause status and reason
		const reason = data?.reason || `${user.username} paused the game`;
		gameSession.broadcastResponse('GAME_PAUSED', {
			reason,
			username: user.username,
			userId: user.id,
			maxPauseDuration: gameSession.maxPauseDuration,
			pauseStartTime: Date.now()
		});
	}
}

export function handleResumeGame(client, data) {
	const { user } = client;
	const clientData = clients.get(user.id);
	const gameSession = gamesList.get(clientData.roomId);
	if (!gameSession || !gameSession.isPaused)
		return;
	if (gameSession.pauseTimer) {
		clearTimeout(gameSession.pauseTimer);
		gameSession.pauseTimer = null;
	}
	const COUNTDOWN_SECONDS = 3;
	// Broadcast countdown before resuming
	gameSession.broadcastResponse('GAME_COUNTDOWN', {
		seconds: COUNTDOWN_SECONDS,
		reason: data?.reason || `${user.username} resumed the game`
	});
	setTimeout(() => {
		gameSession.resumeGame(gamesList);
		gameSession.broadcastResponse('GAME_RESUMED', {
			reason: data?.reason || `${user.username} resumed the game`
		});
	}, COUNTDOWN_SECONDS * 1000);
}
