// FILE TO IMPLEMENT CLIENT-SERVER(WS) COMMUNICATION HANDLERS //

import { GameSession, startGameLoop } from "../engine/GameSession.js"
import { extractUserFromToken } from "../../auth/token.js";

const gamesList = new Map();
const clients = new Map();

/**
 *	The client's auth token is extracted from cookies
 *	The user is authenticated (same flow as your chat system)
 *	The connection is stored in the clients Map for later reference
 */
export async function	registerGameClient(request, connection)
{
	console.log("STEPPED INTO -> registerGameClient");
	// First, extract user from cookies - as in chat logic (or as I understood it)
	const	token = request.cookies.token;
	if (!token)
	{
		console.error("No auth token found");
		connection.send(JSON.stringify({
			type: 'ERROR',
			message: 'Authentication required'
		}));
		return (null);
	}
	const	user = await extractUserFromToken(token);
	if (user && user.id)
	{
		console.log(`User authenticated: ${user.id}`);
		// Register and track connection
		clients.set(user.id, {
			connection,
			roomId: null
		})
		console.log("Connection socket object of registred user:\n", clients.get(user.id).connection);
		return ({user, connection});
	}
	else
	{
		console.error("Invalid user extracted from token");
		connection.send(JSON.stringify({
			type: 'ERROR',
			message: 'Invalid user authentication'
		}));
		return (null);
	}
}

export function	handleGameDisconnect(client, connection)
{
	connection.on('close', () => {
		handleLeaveGame(client);
	});
}

/**
 * handleGameMessage() is the manager for messages, it calls the specific handler functions
 * JOIN_GAME	Player wants to join/create a game	{ roomId: "abc123", gameMode: "1v1" }
 * PLAYER_INPUT	Player moves paddle	{ input: { up: true, down: false } }
 * LEAVE_GAME	Player quits	(no additional data)
 */
export function	handleGameMessage(client, connection)
{
	console.log("STEPPED INTO -> handleGameMessage");
	console.log(`Setting up message handler for user: ${client.user.id}`);
	console.log("Connection state:", connection._readyState);
	console.log("Current connection event listeners:", Object.keys(connection._events));

	try {
	setTimeout(() => {
		console.log("Sending test message to client...");
		connection.send(JSON.stringify({
			type: 'SERVER_TEST',
			message: 'Testing connection'
		}));
	}, 1000);
	} catch (error) {
		console.error("Error sending test message:", error);
	}

	connection.on('message', (message) => {
		console.log("Received message from client");
		console.log("RAW MESSAGE RECEIVED:", message);
		console.log("Message type:", typeof message);
		try
		{
			const data = JSON.parse(message.toString());
			console.log("JSON message:\n", data);
			switch (data.type)
			{
				case 'JOIN_GAME':
					console.log("Launching handleJOINMessage...");
					handleJoinGame(client, data);
					break ;
				case 'PLAYER_INPUT':
					handlePlayerInput(client, data);
					break ;
				case 'LEAVE_GAME':
					handleLeaveGame(client);
					break ;
				case 'PING':
					connection.send(JSON.stringify({ type: 'PONG' }));
					break ;
				default:
					console.log(`Unknown message type: ${data.type}`);
			}	
		}
		catch (error){
			console.error('Game message error:', error);
		}
		console.log("Updated connection event listeners:", Object.keys(connection._events));
	});
}

/**
 * When a player JOINs the game
 */
function handleJoinGame(client, data)
{
	console.log("Launching handleJoinGame...");
	const { user, connection } = client;
	const	gameMode = data.mode;
	const	roomId = data.roomId || `game-${Date.now()}`;

	// 1. Find or create the game session
	let gameSession = gamesList.get(roomId);
	if (!gameSession)
	{
		gameSession = new GameSession(roomId, gameMode);
		gamesList.set(roomId, gameSession);
	}
	// 2. Add player to the game
	const playerNumber = gameSession.addPlayer(user.id, connection);
	if (!playerNumber)
	{
		connection.send(JSON.stringify({
			type: 'ERROR',
			message: 'Game is full'
		}));
		return ;
	}
	clients.set(user.id, { connection, roomId });
	// 3. Send initial game data
	connection.send(JSON.stringify({
		type: 'GAME_INIT',
		playerNumber, // "player1" or "player2" - "playerLeft" or "playerRight"
		config: gameSession.getConfig()
	}));
	// 5. Start game if ready (e.g., 2 players connected + online mode, 1 player connected + 1vAI mode...)
	if (gameSession.shouldStart()) {
		startGameLoop(gameSession, gamesList);
	}
}

/**
 * When a player sends keys input (should be up/down arrow)
 * Server updates the player's paddle position and this updated position is reflected in the next GAME_STATE broadcast
 * TODO: Set interface for controllers, so it will always be arrows, AWSD or AI (?)
 */
function handlePlayerInput(client, data)
{
	const { user } = client;
	const clientData = clients.get(user.id);
	// 1. Find the game session
	const gameSession = gamesList.get(clientData.roomId);
	// 2. Update the player's paddle position
	if (gameSession)
		gameSession.handleInput(user.id, data.input);
}

/**
 * When a player leaves
 */
export function handleLeaveGame(client) {
	const { user } = client;
	const clientData = clients.get(user.id);
	
	// 1. Find and update the game session
	const gameSession = gamesList.get(clientData?.roomId);
	if (gameSession)
	{
		gameSession.removePlayer(user.id);
		// 2. End game if empty
		if (gameSession.isEmpty())
			gamesList.delete(clientData.roomId);
	}
	// 3. Remove client tracking
	clients.delete(user.id);
}

export function handleGameError(client, connection)
{
	connection.on('error', (error) => {
		const { user } = client;

		console.log(`Game error for user ${user.id}:`, error);
		try
		{
			connection.send(JSON.stringify({
				type: 'ERROR',
				message: 'An unexpected error occurred during gameplay'
			}));
		}
		catch (sendError){
			console.error('Failed to send error message to client:', sendError);
		}

		if (error.critical)
			handleLeaveGame(client);
	});
}
