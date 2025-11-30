/**
 * players.js file: player managment methods + AI bot
 */

// Add a player to the game session
export function addPlayer(playerId, connection) {
	if (this.players.size >= 2)
		throw new Error('Game is full');
	const playerNumber = this.players.size === 0 ? 'player1' : 'player2';
	this.players.set(playerId, { connection, playerNumber, ready: false });

	return (playerNumber);
}

// Add a method to update player details
export function setPlayerDetails(playerNumber, userDetails) {
	this.metadata.playerDetails[playerNumber] = userDetails;
}

// Get state for a specific player
export function getPlayerView(playerId) {
	const playerData = this.players.get(playerId);
	if (!playerData)
		return (null);
	return {
		...this.state,
		playerNumber: playerData.playerNumber
	};
}

// Remove a player from the game + stop game if room is empty
export function removePlayer(playerId) {
	this.players.delete(playerId);
	if (this.isEmpty())
		this.destroy();
}

// Handle player disconnect in remote game
export function handlePlayerDisconnect(playerId, gamesList) {
	const disconnectedPlayer = this.players.get(playerId);
	if (!disconnectedPlayer)
		return;

	// Find the other player (winner)
	let winnerId = null;
	for (const [id, p] of this.players) {
		if (id !== playerId) {
			winnerId = id;
			break;
		}
	}

	if (winnerId) {
		const loserKey = disconnectedPlayer.playerNumber;
		const winnerKey = loserKey === 'player1' ? 'player2' : 'player1';

		this.metadata.result.winner = this.metadata.playerDetails[winnerKey];
		this.metadata.result.loser = this.metadata.playerDetails[loserKey];
		this.metadata.result.endReason = 'Opponent disconnected';

		// End the game and save logs
		this.endGame(gamesList, true);
	}
	else {
		// No other player? Just remove.
		this.removePlayer(playerId);
	}
}

// Handle player input
export function movePlayerPaddle(playerId, input) {
	const playerData = this.players.get(playerId);
	if (!playerData)
		return;

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
