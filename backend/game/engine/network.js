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
			default:
				break ;
		}
		connection.send(JSON.stringify(response));
	});
}
