import { resetState } from "./gameState.js";
/**
 * GameSession.js file:
 * 	- GameSession class initial declaration (constructor)
 * 	- Aux/utils methods (getters/setters, debug) and core methods that don't fit elsewhere
 */
export default class GameSession
{
	constructor(roomId, gameMode)
	{
		this.roomId = roomId;
		this.gameMode = gameMode;
		this.players = new Map();
		this.state = this.resetState();
		this.resetBall();
		this.gameLoop = null;
		this.aiInterval = null;
		this.lastUpdateTime = Date.now();
		this.isResetting = false;
	}

	// Start the game loop
	startGameLoop()
	{
		this.gameLoop = setInterval(() => {
			const now = Date.now();
			const deltaTime = 16 / 1000;
			this.update(deltaTime);
			this.broadcastState();
		}, 16);
	}

	// Get game configuration
	getConfig()
	{
		return {
			roomId: this.roomId,
			gameMode: this.gameMode,
			playerCount: this.players.size
		};
	}

	// Check if game should start
	shouldStart()
	{
		if (this.gameMode === '1vAI' || this.gameMode === '1v1')
			return (this.players.size === 1);
		return (this.players.size === 2);
	}

	// Check if game has no players
	isEmpty()
	{
		return (this.players.size === 0);
	}

	// Clean up resources
	destroy()
	{
		clearInterval(this.gameLoop);
		clearInterval(this.aiInterval);
	}
}

export function startGameLoop(gameSession, gamesList)
{
	let lastUpdateTime = Date.now();
	const gameLoop = setInterval(() => {
		// 1. Check if game still exists, if not, clear and return
		if (!gamesList.has(gameSession.roomId))
		{
			clearInterval(gameLoop);
			return ;
		}
		// 2. Calculate time since last update
		const now = Date.now();
		const deltaTime = (now - lastUpdateTime) / 1000;
		lastUpdateTime = now;
		// 3. Update game state (ball position, scores, etc.)
		gameSession.update(deltaTime);
		// 4. Send updated state to all players in game
		gameSession.getConnections().forEach((connection, playerId) => {
			if (connection.readyState === 1)
			{ 
				connection.send(JSON.stringify({
					type: 'GAME_STATE',
					state: gameSession.getPlayerView(playerId),
					timestamp: now
				}));
			}
		});
	}, 16); // ~60fps (1000ms/60 ≈ 16ms)
}
