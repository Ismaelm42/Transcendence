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
export function	broadcastState()
{
	const connections = this.getConnections();
	connections.forEach((connection, playerId) => {
		if (connection.readyState === 1)
		{
			connection.send(JSON.stringify({
				type: 'GAME_STATE',
				state: this.getPlayerView(playerId),
				timestamp: Date.now()
			}));
		}
	});
}

