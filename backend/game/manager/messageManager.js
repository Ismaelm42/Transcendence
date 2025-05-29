/**
 * messageManager.js file: server-side handlers for websocket types of messages
 */
import GameSession from "../engine/index.js";
import { gamesList, clients } from "./eventManager.js";

/**
 * When a player JOINs the game
 */
export function handleJoinGame(client, data)
{
	console.log("Launching handleJoinGame...");
	const	{ user, connection } = client;
	const	gameMode = data.mode;
	const	roomId = data.roomId || `game-${Date.now()}`;
	const	config = data.config || { scoreLimit: 5, difficulty: 'medium' };

	// 1. Find or create the game session
	let gameSession = gamesList.get(roomId);
	if (!gameSession)
	{
		gameSession = new GameSession(roomId, gameMode);
		gamesList.set(roomId, gameSession);
		// Apply game configuration
		if (config)
		{
			if (config.scoreLimit)
				gameSession.winScore = config.scoreLimit;
			if (config.difficulty)
				gameSession.setDifficulty(config.difficulty);
		}
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
	// 3. Store game player logs! TODO: check if should wait if shouldStart()
	gameSession.setPlayerDetails(playerNumber, user);
	clients.set(user.id, { connection, roomId });
	// 4. Send initial game data
	connection.send(JSON.stringify({
		type: 'GAME_INIT',
		playerNumber,
		config: gameSession.getConfig()
	}));
	// 5. Start game if ready (e.g., 2 players connected + online mode, 1 player connected + 1vAI mode...)
	if (gameSession.shouldStart())
	{
		gameSession.state = gameSession.resetState();
		gameSession.getConnections().forEach((conn) => {
			if (conn.readyState === 1)
			{
				conn.send(JSON.stringify({
					type: 'GAME_START',
					timestamp: Date.now()
				}));
			}
		});
		gameSession.startGameLoop(gamesList);
	}
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
	gameSession.movePlayerPaddle(user.id, data.input, data.input.player);
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
		if (gameSession.isEmpty() || gameSession.isFinished || gameSession.shouldCleanup)
			gamesList.delete(clientData.roomId);
	}
	// 3. Remove client tracking
	clients.delete(user.id);
}


export function handleRestartGame(client, data)
{
	const { user } = client;
	const clientData = clients.get(user.id);
	
	// Delete old game session if it exists
	const oldGameSession = gamesList.get(clientData?.roomId);
	if (oldGameSession)
		gamesList.delete(clientData.roomId);

	// Create a new game with same config
	const gameMode = data.mode || (oldGameSession ? oldGameSession.gameMode : '1v1');
	const roomId = `game-${Date.now()}`;
	const config = data.config || { 
		scoreLimit: oldGameSession ? oldGameSession.winScore : 5, 
		difficulty: oldGameSession ? oldGameSession.difficulty : 'medium' 
	};
	
	// Call join game with new parameters
	handleJoinGame({user, connection: client.connection}, {
		mode: gameMode,
		roomId: roomId,
		config: config
	});
}
