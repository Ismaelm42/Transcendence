// GameSession Class implementation

export class GameSession
{
	constructor(roomId, gameMode)
	{
		this.roomId = roomId;
		this.gameMode = gameMode;
		this.players = new Map();
		this.state = this.resetState();
		this.gameLoop = null;
		this.aiInterval = null;
		this.lastUpdateTime = Date.now();
		this.isResetting = false; // Add this flag
	}

	// Initialize or reset game state
	resetState()
	{
		return {
			ball: { x: 0.5, y: 0.5, dx: 0.20, dy: 0.07 },
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
		// Ball movement with appropriate clamping
		this.state.ball.x += this.state.ball.dx * deltaTime;
		this.state.ball.y += this.state.ball.dy * deltaTime;
	
		// Wall collisions (top/bottom)
		// Add a small buffer (0.01) to prevent ball getting stuck
		if (this.state.ball.y <= 0.01) {
			this.state.ball.y = 0.01;
			this.state.ball.dy = Math.abs(this.state.ball.dy);
		} 
		else if (this.state.ball.y >= 0.99) {
			this.state.ball.y = 0.99;
			this.state.ball.dy = -Math.abs(this.state.ball.dy);
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
		
		// Store last paddle position to detect movement
		if (!paddle.lastY) {
			paddle.lastY = paddle.y;
		}
		
		// Calculate paddle velocity (how fast it's moving)
		const paddleVelocity = paddle.y - paddle.lastY;
		paddle.lastY = paddle.y; // Update for next frame
		
		// Paddle dimensions
		const paddleWidth = 0.025;  // 2.5% of screen width
		const paddleHeight = 0.15;  // 15% of screen height
		
		// Calculate paddle position
		const paddleX = playerNumber === 'player1' ? 0.03 : (0.97 - paddleWidth);
		const paddleTop = paddle.y - (paddleHeight/2);
		const paddleBottom = paddle.y + (paddleHeight/2);
		const collisionEdgeX = playerNumber === 'player1' ? 
			paddleX + paddleWidth : paddleX;
		
		// Ball properties
		const ballRadius = 0.015;
		
		// Collision detection
		const ballInYRange = ball.y >= paddleTop && ball.y <= paddleBottom;
		let ballAtCollisionX = false;
		
		if (playerNumber === 'player1') {
			ballAtCollisionX = (ball.x - ballRadius) <= collisionEdgeX && ball.x >= paddleX;
		} else {
			ballAtCollisionX = (ball.x + ballRadius) >= collisionEdgeX && ball.x <= (paddleX + paddleWidth);
		}
		
		// Check for collision
		if (ballAtCollisionX && ballInYRange) {
			// Position adjustment to prevent penetration
			if (playerNumber === 'player1') {
				this.state.ball.x = collisionEdgeX + ballRadius + 0.001;
			} else {
				this.state.ball.x = collisionEdgeX - ballRadius - 0.001;
			}
			
			// Calculate current ball speed
			const currentSpeed = Math.sqrt(
				this.state.ball.dx * this.state.ball.dx + 
				this.state.ball.dy * this.state.ball.dy
			);
			
			// Increase speed by 7% (more noticeable than 5%)
			const speedMultiplier = 1.07;
			
			// ATARI-STYLE BOUNCE PHYSICS:
			// 1. Calculate relative position on paddle (from -1 at top to +1 at bottom)
			const hitPosition = (ball.y - paddle.y) / (paddleHeight/2);
			
			// 2. Base angle change - more dramatic at edges
			// This creates a more pronounced angle when hitting near the edges
			let angleEffect = hitPosition * 0.3; // Stronger effect than before (was 0.12)
			
			// 3. Add paddle movement effect - if paddle is moving, it influences the ball direction
			// This is what gives that classic Atari pong feel
			const paddleMovementEffect = paddleVelocity * 3.0; // Amplify paddle movement effect
			angleEffect += paddleMovementEffect;
			
			// 4. Reverse horizontal direction with speed increase  
			this.state.ball.dx *= -speedMultiplier;
			
			// 5. Apply the combined angle effect
			this.state.ball.dy += angleEffect;
			
			// 6. Edge cases - hitting extreme top/bottom of paddle creates extreme angles
			// This makes edge hits more dramatic and skillful
			if (Math.abs(hitPosition) > 0.8) { // Near the edge (top 20% or bottom 20%)
				// Amplify the angle even more for edge hits
				this.state.ball.dy += (hitPosition > 0 ? 0.1 : -0.1);
			}
			
			// 7. Cap maximum speed to prevent the game from becoming unplayable
			const maxSpeed = 0.6; // Adjust this value as needed
			const newSpeed = Math.sqrt(
				this.state.ball.dx * this.state.ball.dx + 
				this.state.ball.dy * this.state.ball.dy
			);
			
			if (newSpeed > maxSpeed) {
				// Scale back to maximum speed
				const scaleFactor = maxSpeed / newSpeed;
				this.state.ball.dx *= scaleFactor;
				this.state.ball.dy *= scaleFactor;
			}
			
			console.log(`Paddle hit: ${playerNumber}, speed: ${newSpeed.toFixed(2)}, angle effect: ${angleEffect.toFixed(2)}`);
		}
	}

	checkScoring() {
		const ball = this.state.ball;
	
		// Skip scoring check if already in reset phase
		if (this.isResetting) return;
	
		// Player 1 scores (ball passes right edge)
		if (ball.x >= 1) {
			this.state.scores[0]++;
			this.isResetting = true;
			
			// Freeze the ball
			this.state.ball.dx = 0;
			this.state.ball.dy = 0;
			
			// Reset after delay
			setTimeout(() => {
				this.resetBall('right');
				this.isResetting = false;
			}, 1000);
		}
		// Player 2 scores (ball passes left edge)
		else if (ball.x <= 0) {
			this.state.scores[1]++;
			this.isResetting = true;
			
			// Freeze the ball
			this.state.ball.dx = 0;
			this.state.ball.dy = 0;
			
			// Reset after delay
			setTimeout(() => {
				this.resetBall('left');
				this.isResetting = false;
			}, 1000);
		}
	}

	resetBall(scoringDirection) {
		// Place ball in center
		const centerX = 0.5; 
		const centerY = 0.5;
		
		// Set reasonable initial velocity
		const speed = 0.20;
		
		// Direction should be opposite of who scored
		// If scoringDirection is not provided, choose randomly
		let direction;
		if (scoringDirection === undefined) {
			direction = Math.random() > 0.5 ? 1 : -1;
		} else {
			// If ball went out on right side (x>=1), player1 scored
			// So direct ball toward player2 (direction=1)
			// If ball went out on left side (x<=0), player2 scored
			// So direct ball toward player1 (direction=-1)
			direction = scoringDirection === 'right' ? 1 : -1;
		}
		
		// Small random angle variance
		const angleVariance = (Math.random() * 0.1) - 0.05;
		
		this.state.ball = { 
			x: centerX, 
			y: centerY, 
			dx: speed * direction, 
			dy: 0.05 + angleVariance 
		};
		
		console.log("Ball reset with velocity:", this.state.ball.dx, this.state.ball.dy, "direction:", direction);
	}

	// Handle player input
	handleInput(playerId, input) {
		const playerData = this.players.get(playerId);
		if (!playerData) return;
	
		const paddle = this.state.paddles[playerData.playerNumber];
		const speed = 0.020; // Slightly slower for better control
		const paddleHeight = 0.15;
		
		// Calculate the exact boundaries
		const minY = paddleHeight / 2;
		const maxY = 1 - (paddleHeight / 2);
		
		// Move paddle with boundary enforcement
		if (input.up) {
			paddle.y = Math.max(minY, paddle.y - speed);
		}
		if (input.down) {
			paddle.y = Math.min(maxY, paddle.y + speed);
		}
		
		// Double-check boundaries to ensure paddle is fully contained
		if (paddle.y < minY) paddle.y = minY;
		if (paddle.y > maxY) paddle.y = maxY;
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
	startAI() {
		this.aiInterval = setInterval(() => {
			const ballY = this.state.ball.y;
			const paddle = this.state.paddles.player2;
			
			// Store last position to track movement
			if (!paddle.lastY) {
				paddle.lastY = paddle.y;
			}
			
			// Old position
			const oldY = paddle.y;
			
			// Increase tracking speed from 0.1 to 0.13 (30% faster)
			paddle.y += (ballY - paddle.y) * 0.13;
			
			// Respect boundaries for AI paddle too
			const paddleHeight = 0.15;
			const minY = paddleHeight / 2;
			const maxY = 1 - (paddleHeight / 2);
			
			if (paddle.y < minY) paddle.y = minY;
			if (paddle.y > maxY) paddle.y = maxY;
			
			// Track velocity
			paddle.lastY = oldY;
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

// TODO: Address the gameSessions map approach
export function startGameLoop(gameSession)
{
	let lastUpdateTime = Date.now();
	const gameLoop = setInterval(() => {
		// 1. Check if game still exists
		// if (!gameSessions.has(gameSession.roomId))
		// {
		// 	clearInterval(gameLoop);
		// 	return ;
		// }
		// 2. Calculate time since last update
		const now = Date.now();
		const deltaTime = (now - lastUpdateTime) / 1000; // Convert to seconds
		lastUpdateTime = now;
		// 3. Update game state (ball position, scores, etc.)
		gameSession.update(deltaTime);
		// 4. Send updated state to all players in game
		gameSession.getConnections().forEach((connection, playerId) => {
			if (connection.readyState === 1) // OPEN
			{ 
				connection.send(JSON.stringify({
					type: 'GAME_STATE',
					state: gameSession.getPlayerState(playerId),
					timestamp: now
				}));
			}
		});
	}, 16); // ~60fps (1000ms/60 ≈ 16ms)
}
