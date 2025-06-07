/**
 * messageManager.js file: server-side handlers for websocket types of messages
 */
import GameSession from "../engine/index.js";
import { gamesList, clients } from "./eventManager.js";
import { crud } from '../../crud/crud.js';

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
	const	secondPlayerInfo = data.player2 || null;
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
	// 5. Set second playerInfo if 1v1 or 1vAI - no more connections needed
	if (secondPlayerInfo && (gameMode === '1vAI' || gameMode === '1v1'))
		gameSession.setPlayerDetails('player2', secondPlayerInfo);
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

export async function	handlePlayerInfo(client, data)
{
	let 	user = null;
	if (data.mode && data.mode === 'local')
	{
		user = {
			id: client.user.id,
			username: client.user.username,
			tournamentUsername: client.user.tournamentUsername,
			email: client.user.email,
			avatarPath: client.user.avatarPath
		};
	}
	else if (data.mode && data.mode === 'external' && data.email)
	{
		try
		{
			user = await crud.user.getUserByEmail(data.email);
			if (!user)
			{
				console.log(`Error: User not found for email ${data.email}`);
				user = null;
				return ;
			}
		}
		catch (error){
			console.error("Error while fetching user by email:", error);
		}
	}
	client.connection.send(JSON.stringify({
			type: 'USER_INFO',
			mode: data.mode,
			user: user
	}));
}

export function handleClientReady(client, data)
{
	const { user } = client;
	const clientData = clients.get(user.id);
	const gameSession = gamesList.get(clientData.roomId);
	if (!gameSession)
		return;
	const player = gameSession.players.get(user.id);
	if (player)
		player.ready = true;

	if (gameSession.shouldStart())
	{
		const allReady = Array.from(gameSession.players.values()).every(p => p.ready);
		if (allReady && !gameSession.gameLoop)
		{
			gameSession.state = gameSession.resetState();
			gameSession.broadcastResponse('GAME_START');
			gameSession.startGameLoop(gamesList);
		}
	}
}
