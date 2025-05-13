// GameSession Class implementation

export class GameSession
{
	constructor(roomId, gameMode)
	{
		this.roomId = roomId;
		this.gameMode = gameMode;
		this.players = new Map(); // playerId -> { connection, playerNumber }
		this.state = this.resetState();
		this.gameLoop = null;
		this.aiInterval = null;
		this.lastUpdateTime = Date.now();
	}

	// Initialize or reset game state
	resetState()
	{
		return {
			ball: { x: 0.5, y: 0.5, dx: 0.02, dy: 0.01 },
			paddles: {
				player1: { y: 0.5 },
				player2: { y: 0.5 }
			},
			scores: [0, 0]
		};
	}

	// Add a player to the game
	addPlayer(playerId, connection)
	{
		if (this.players.size >= 2)
			throw new Error('Game is full');
		const playerNumber = this.players.size === 0 ? 'player1' : 'player2';
		this.players.set(playerId, { connection, playerNumber });
		// Start AI if needed
		if (this.gameMode === '1vAI' && this.players.size === 1)
			this.startAI();
		return (playerNumber);
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
	shouldStart() {
		if (this.gameMode === '1vAI') {
			return this.players.size === 1;
		}
		return this.players.size === 2;
	}

	// Main game update loop
	update(deltaTime)
	{
		// Ball movement
		this.state.ball.x += this.state.ball.dx * deltaTime;
		this.state.ball.y += this.state.ball.dy * deltaTime;

		// Wall collisions (top/bottom)
		if (this.state.ball.y <= 0 || this.state.ball.y >= 1) {
			this.state.ball.dy *= -1;
		}

		// Paddle collisions
		this.checkPaddleCollision('player1');
		this.checkPaddleCollision('player2');

		// Scoring
		this.checkScoring();
	}

	checkPaddleCollision(playerNumber) {
		const paddle = this.state.paddles[playerNumber];
		const ball = this.state.ball;
		const paddleWidth = 0.02;
		const paddleHeight = 0.2;

		const paddleX = playerNumber === 'player1' ? 0 : 1 - paddleWidth;
		const paddleTop = paddle.y - paddleHeight / 2;
		const paddleBottom = paddle.y + paddleHeight / 2;

		if (
			ball.x >= paddleX && ball.x <= paddleX + paddleWidth &&
			ball.y >= paddleTop && ball.y <= paddleBottom
		) {
			this.state.ball.dx *= -1.05; // Increase speed slightly on hit
			// Add angle based on where ball hits paddle
			this.state.ball.dy += (ball.y - paddle.y) * 0.1;
		}
	}

	checkScoring() {
		const ball = this.state.ball;

		// Player 1 scores (ball passes right edge)
		if (ball.x >= 1) {
			this.state.scores[0]++;
			this.resetBall();
		}
		// Player 2 scores (ball passes left edge)
		else if (ball.x <= 0) {
			this.state.scores[1]++;
			this.resetBall();
		}
	}

	resetBall() {
		this.state.ball = { x: 0.5, y: 0.5, dx: 0.02 * (Math.random() > 0.5 ? 1 : -1), dy: 0.01 };
	}

	// Handle player input
	handleInput(playerId, input) {
		const playerData = this.players.get(playerId);
		if (!playerData) return;

		const paddle = this.state.paddles[playerData.playerNumber];
		const speed = 0.02;

		if (input.up) {
			paddle.y = Math.max(0, paddle.y - speed);
		}
		if (input.down) {
			paddle.y = Math.min(1, paddle.y + speed);
		}
	}

	// Get all active connections
	getConnections() {
		const connections = new Map();
		this.players.forEach((data, playerId) => {
			connections.set(playerId, data.connection);
		});
		return connections;
	}

	getPlayerState(playerId) {
		const playerData = this.players.get(playerId);
		return {
			...this.state,
			playerNumber: playerData?.playerNumber
		};
	}

	// Remove a player from the game
	removePlayer(playerId) {
		this.players.delete(playerId);
		
		// Stop game if empty
		if (this.isEmpty()) {
			this.destroy();
		}
	}

	// Check if game has no players
	isEmpty() {
		return this.players.size === 0;
	}

	// Start AI opponent
	startAI()
	{
		this.aiInterval = setInterval(() => {
			const ballY = this.state.ball.y;
			const paddle = this.state.paddles.player2;
			paddle.y += (ballY - paddle.y) * 0.1;
		}, 50);
	}

	// Start the game loop
	startGameLoop()
	{
		this.gameLoop = setInterval(() => {
			const now = Date.now();
			const deltaTime = 16 / 1000; // Fixed delta for stable physics
			this.update(deltaTime);
			this.broadcastState();
		}, 16);
	}

	// Send game state to all players
	broadcastState()
	{
		const connections = this.getConnections();
		connections.forEach((connection, playerId) => {
			if (connection.readyState === 1) { // 1 = OPEN
				connection.send(JSON.stringify({
					type: 'GAME_STATE',
					state: this.getPlayerView(playerId),
					timestamp: Date.now()
				}));
			}
		});
	}

	// Get state for a specific player
	getPlayerView(playerId) {
		const playerData = this.players.get(playerId);
		if (!playerData) return null;

		return {
			...this.state,
			playerNumber: playerData.playerNumber
		};
	}

	// Clean up resources
	destroy() {
		clearInterval(this.gameLoop);
		clearInterval(this.aiInterval);
	}
}
