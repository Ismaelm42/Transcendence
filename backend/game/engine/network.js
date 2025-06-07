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
export function	broadcastResponse(responseType)
{
	const	connections = this.getConnections();

	connections.forEach((connection, playerId) => {
		if (connection.readyState !== 1)
			return;
		let response = {
			type: responseType,
			timestamp: Date.now(),
		};
		switch (responseType)
		{
			case 'GAME_STATE':
				response.state = this.getPlayerView(playerId);
				break;
			case 'GAME_END':
				response.result = {
					winner: this.metadata.result.winner,
					loser: this.metadata.result.loser,
					score: this.state.scores
				},
				response.stats = {
					duration: this.metadata.duration,
					score: this.state.scores
				}
				break;
			case 'GAME_START':
				break;
			default:
				console.error(`Unknown responseType to broadcast: ${responseType}`);
				return;
		}
		connection.send(JSON.stringify(response));
	});
}
