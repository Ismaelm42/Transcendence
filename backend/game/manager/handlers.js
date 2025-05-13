// FILE TO IMPLEMENT CLIENT-SERVER(WS) COMMUNICATION HANDLERS //

import { GameSession } from "../engine/GameSession.js"

const gameSessions = new Map();
const clients = new Map();

/**
 * handleGameMessage() is the manager for messages, it calls the specific handler functions
 * JOIN_GAME	Player wants to join/create a game	{ roomId: "abc123", gameMode: "1v1" }
 * PLAYER_INPUT	Player moves paddle	{ input: { up: true, down: false } }
 * LEAVE_GAME	Player quits	(no additional data)
 */
export function	handleGameMessage(client, connection)
{
	connection.socket.on('message', (message) => {
		try
		{
			const data = JSON.parse(message.toString());
			if (data.type === 'JOIN_GAME')
				handleJoinGame(client, data);
			else if (data.type === 'PLAYER_INPUT')
				handlePlayerInput(client, data);
			else if (data.type === 'LEAVE_GAME')
				handleLeaveGame(client);
		}
		catch (error){
			console.error('Game message error:', error);
		}
	});
}

/**
 * When a player JOINs the game
 * TODO: implement GameSession class/interface
 * TODO: implement shouldStart()
 */
function handleJoinGame(client, data)
{
	const { user, connection } = client;
	const { roomId, gameMode } = data;
	// 1. Find or create the game session
	let gameSession = gameSessions.get(roomId);
	if (!gameSession)
	{
		gameSession = new GameSession(roomId, gameMode);
		gameSessions.set(roomId, gameSession);
	}
	// 2. Add player to the game
	const playerNumber = gameSession.addPlayer(user.id, connection);
	if (!playerNumber)
	{
		connection.socket.send(JSON.stringify({
			type: 'ERROR',
			message: 'Game is full'
		}));
		return ;
	}
	clients.set(user.id, { connection, roomId });
	// 3. Send initial game data
	connection.socket.send(JSON.stringify({
		type: 'GAME_INIT',
		playerNumber, // "player1" or "player2" - "playerLeft" or "playerRight"
		config: gameSession.getConfig()
	}));
	// 5. Start game if ready (e.g., 2 players connected + online mode, 1 player connected + 1vAI mode...)
	if (gameSession.shouldStart()) {
		startGameLoop(gameSession);
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
	const gameSession = gameSessions.get(clientData.roomId);
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
	const gameSession = gameSessions.get(clientData?.roomId);
	if (gameSession)
	{
		gameSession.removePlayer(user.id);
		// 2. End game if empty
		if (gameSession.isEmpty())
			gameSessions.delete(clientData.roomId);
	}
	// 3. Remove client tracking
	clients.delete(user.id);
}
