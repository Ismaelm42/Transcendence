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
		this.isPaused = false;
		this.aiInterval = null;
		this.lastUpdateTime = Date.now();
		this.isResetting = false;
		this.winScore = 5;
		this.difficulty = 'medium';
		this.isFinished = false;
		this.shouldCleanup = false;
		this.ballSpeedMultiplier = 1.50;
		this.ballSpeedIncrease = 1.10;
		this.ballMaxSpeed = 0.75;

		// Timer values and variables
		this.pauseTimer = null;
		this.resumeTimeout = null;
		this.maxPauseDuration = 60000 * 0.5; // 60000 == 1 minute
		this.onWaitDuration = 60000 * 5;
		this.pauseStartTime = null;

		// For game log and database storage
		this.metadata = {
			id: this.roomId,
			mode: this.gameMode,
			endTime: null,
			duration: 0,
			tournamentId: null,
			playerDetails: {
				// Will be full user object - player1: {id, username, tournamentName,...}
				player1: null,
				player2: null
			},
			result: {
				winner: null,
				loser: null,
				finalScore: [0, 0],
				endReason: null
			},
			config: {
				scoreLimit: this.winScore,
				difficulty: this.difficulty
			}
		};
	}

	startGameLoop(gamesList)
	{
		let lastUpdateTime = Date.now();
		this.gameLoop = setInterval(() => {
			// 1. Check if game still exists, if not, clear and return
			if (!gamesList.has(this.roomId) || this.isFinished || this.shouldCleanup)
			{
				clearInterval(this.gameLoop);
				return ;
			}
			// 2. Calculate time since last update
			const now = Date.now();
			const deltaTime = (now - lastUpdateTime) / 1000;
			lastUpdateTime = now;
			// 3. Update game state (ball position, scores, etc.)
			this.update(deltaTime);
			// 4. Send updated state to all players in game
			this.broadcastResponse('GAME_STATE');
		}, 16); // ~60fps (1000ms/60 ≈ 16ms)
	}

	pauseGame()
	{
		if (this.gameLoop)
		{
			clearInterval(this.gameLoop);
			this.gameLoop = null;
			this.isPaused = true;
			this.pauseStartTime = Date.now()
		}
	}

	resumeGame(gameList)
	{
		if (!this.gameLoop && this.isPaused)
		{
			this.startGameLoop(gameList);
			this.isPaused = false;
			this.pauseStartTime = null;
		}
	}

	// Get game configuration
	getConfig()
	{
		return {
			roomId: this.roomId,
			gameMode: this.gameMode,
			playerCount: this.players.size,
			scoreLimit: this.winScore,
			difficulty: this.difficulty,
			ballSpeedMultiplier: this.ballSpeedMultiplier
		};
	}

	// Check if game should start
	shouldStart()
	{
		if ((this.gameMode === '1vAI' || this.gameMode === '1v1'))
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

	// Method to set tournament ID if part of a tournament - not using yet, will move to tournament file later
	setTournamentId(tournamentId)
	{
		this.metadata.tournamentId = tournamentId;
	}
}

