/**
 * players.js file: player managment methods + AI bot
 */

// Add a player to the game
export function addPlayer(playerId, connection)
{
	if (this.players.size >= 2)
		throw new Error('Game is full');
	const playerNumber = this.players.size === 0 ? 'player1' : 'player2';
	this.players.set(playerId, { connection, playerNumber });

	if (this.gameMode === '1vAI' && this.players.size === 1)
		this.startAI();
	return (playerNumber);
}

// Get state for a specific player
export function getPlayerView(playerId)
{
	const playerData = this.players.get(playerId);
	if (!playerData)
		return (null);
	return {
		...this.state,
		playerNumber: playerData.playerNumber
	};
}

// Remove a player from the game + stop game if room is empty
export function removePlayer(playerId)
{
	this.players.delete(playerId);
	if (this.isEmpty())
		this.destroy();
}

// Start AI opponent which will track ball an move paddle to it
export function startAI()
{
	this.aiInterval = setInterval(() => {
		const ballY = this.state.ball.y;
		const paddle = this.state.paddles.player2;
		
		// Store last position to track movement
		if (!paddle.lastY)
			paddle.lastY = paddle.y;
		
		// Old position
		const oldY = paddle.y;
		// Tracking speed
		paddle.y += (ballY - paddle.y) * 0.13;
		
		// Paddle boundries (so they don't move out of canvas)
		const paddleHeight = 0.15;
		const minY = paddleHeight / 2;
		const maxY = 1 - (paddleHeight / 2);
		if (paddle.y < minY)
			paddle.y = minY;
		if (paddle.y > maxY)
			paddle.y = maxY;
		// Track velocity
		paddle.lastY = oldY;
	}, 50);
}

// Handle player input
export function movePlayerPaddle(playerId, input)
{
	const playerData = this.players.get(playerId);
	if (!playerData)
		return ;

	const paddle = this.state.paddles[input.player];
	const speed = 0.020;
	const paddleHeight = 0.15;
	// Paddle limit canvas boundaries
	const minY = paddleHeight / 2;
	const maxY = 1 - (paddleHeight / 2);
	
	// Move paddle (math.max() limit to canvas boundries, as can move maximum to the edges)
	if (input.up)
		paddle.y = Math.max(minY, paddle.y - speed);
	if (input.down)
		paddle.y = Math.min(maxY, paddle.y + speed);
	// Double-check boundaries and normalize them if needed
	if (paddle.y < minY)
		paddle.y = minY;
	if (paddle.y > maxY)
		paddle.y = maxY;
}
