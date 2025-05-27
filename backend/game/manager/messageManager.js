/**
 * messageManager.js file: server-side handlers for websocket types of messages
 */
import GameSession from "../engine/index.js";
import { startGameLoop } from "../engine/GameSession.js"
import { gamesList, clients } from "./eventManager.js";

/**
 * When a player JOINs the game
 */
export function handleJoinGame(client, data)
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
		playerNumber,
		config: gameSession.getConfig()
	}));
	// 5. Start game if ready (e.g., 2 players connected + online mode, 1 player connected + 1vAI mode...)
	if (gameSession.shouldStart())
		startGameLoop(gameSession, gamesList);
}

/**
 * When a player sends keys input (should be up/down for paddle movement)
 * Server updates the player's paddle position and this updated position is reflected in the next GAME_STATE broadcast
 */
export function handlePlayerInput(client, data)
{
	const { user } = client;
	const clientData = clients.get(user.id);
	const gameSession = gamesList.get(clientData.roomId);
	if (!gameSession)
		return ;
	gameSession.movePlayerPaddle(user.id, data.input);
}

/**
 * When a player leaves
 */
export function handleLeaveGame(client)
{
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
