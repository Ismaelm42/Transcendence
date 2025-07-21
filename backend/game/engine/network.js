/**
 * network.js file: getters and setters for game state and connections
 */

// Get all active connections
export function	getConnections()
{
	const connections = new Map();
	this.players.forEach((data, playerId) => {
		connections.set(playerId, data.connection);
	});
	return (connections);
}

// Send game state to all players
export function	broadcastResponse(responseType, payload = {})
{
	const	connections = this.getConnections();

	connections.forEach((connection, playerId) => {
		if (connection.readyState !== 1)
			return ;
		let response = {
			type: responseType,
			timestamp: Date.now(),
			...payload
		};
		switch (responseType)
		{
			case 'GAME_STATE':
				response.state = this.getPlayerView(playerId);
				break ;
			case 'GAME_END':
				response.result = {
					winner: this.metadata.result.winner?.username,
					loser: this.metadata.result.loser?.username,
					score: this.state.scores
				},
				response.stats = {
					duration: this.metadata.duration,
					score: this.state.scores
				}
				// TODO: maybe add another logic for tournament games if needed
				break ;
			case 'GAME_PAUSED':
				response.remainingTime = payload.remainingTime;
				break;
			case 'GAME_ABANDONED':
				response.reason = payload.reason;
				break;	
			default:
				break ;
		}
		connection.send(JSON.stringify(response));
	});
}

export function checkPlayersStatus(gamesList)
{
	// Count active connections
	let activePlayers = 0;
	this.players.forEach((playerData, playerId) => {
		if (playerData.connection.readyState === 1)
			activePlayers++;
	});

	if (activePlayers >= 2)
	{
		// Resume game if enough players
		this.resumeGame(gamesList);
		this.broadcastResponse('GAME_RESUMED', {
			reason: 'Pause timeout expired - resuming game'
		});
	}
	else
	{
		// End game if not enough players
		this.broadcastResponse('GAME_ABANDONED', {
			reason: 'Game ended due to player disconnection during pause'
		});
		this.endGame(gamesList);
	}
	// Cleanup
	this.pauseTimer = null;
	this.pauseStartTime = null;
}
