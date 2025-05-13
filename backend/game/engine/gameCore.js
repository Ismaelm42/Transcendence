
function startGameLoop(gameSession)
{
	let lastUpdateTime = Date.now();
	const gameLoop = setInterval(() => {
		// 1. Check if game still exists
		if (!gameSessions.has(gameSession.roomId))
		{
			clearInterval(gameLoop);
			return ;
		}
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
