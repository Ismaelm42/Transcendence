/**
 * network.js file: getters and setters for game state and connections
 */

// Get all active connections
export function getConnections() {
	const connections = new Map();
	this.players.forEach((data, playerId) => {
		connections.set(playerId, data.connection);
	});
	return (connections);
}

// Send game state to all players
export function broadcastResponse(responseType, payload = {}) {
	const connections = this.getConnections();

	connections.forEach((connection, playerId) => {
		if (connection.readyState !== 1)
			return;
		let response = {
			type: responseType,
			timestamp: Date.now(),
			...payload
		};
		switch (responseType) {
			case 'GAME_STATE':
				response.state = this.getPlayerView(playerId);
				break;
			case 'GAME_END':
				response.result = {
					winner: this.metadata.result.winner?.username,
					loser: this.metadata.result.loser?.username,
					score: this.state.scores,
					endReason: this.metadata.result.endReason ?? 'Game ended'
				},
					response.stats = {
						duration: this.metadata.duration,
						score: this.state.scores
					}
				break;
			case 'GAME_PAUSED':
				response = {
					...response,
					maxPauseDuration: payload.maxPauseDuration,
					pauseStartTime: payload.pauseStartTime,
					reason: payload.reason,
					pausingUser: payload.username
				};
				break;
			case 'GAME_RESUMED':
				response = {
					...response,
					reason: payload.reason,
					resumingUser: payload.username
				};
				break;
			default:
				break;
		}
		connection.send(JSON.stringify(response));
	});
}

export function checkPlayersStatus(gamesList) {
	const totalPlayers = (this.players instanceof Map)
		? this.players.size
		: Array.isArray(this.players)
			? this.players.length
			: Object.keys(this.players || {}).length;

	// Count active connections
	let activePlayers = 0;
	this.players.forEach((playerData, playerId) => {
		if (playerData.connection.readyState === 1 && playerData.active)
			activePlayers++;
	});

	if (activePlayers === totalPlayers) {
		const COUNTDOWN_SECONDS = 3;
		this.broadcastResponse('GAME_COUNTDOWN', {
			seconds: COUNTDOWN_SECONDS,
			reason: 'Pause timeout expired - resuming game'
		});
		setTimeout(() => {
			this.resumeGame(gamesList);
			this.broadcastResponse('GAME_RESUMED', {
				reason: 'Pause timeout expired - resuming game'
			});
		}, COUNTDOWN_SECONDS * 1000);
	}
	else {
		// End game if not enough players and set abandoned as reason
		// Identify who is missing
		let winner = null;
		let loser = null;

		this.players.forEach((playerData, playerId) => {
			if (playerData.connection.readyState === 1 && playerData.active) {
				// This player is active, so they are the winner
				winner = this.metadata.playerDetails[playerData.playerNumber];
			} else {
				// This player is inactive, so they are the loser
				loser = this.metadata.playerDetails[playerData.playerNumber];
			}
		});

		// If we found a winner (meaning one player stayed and one left), set the result
		if (winner && loser) {
			this.metadata.result.winner = winner;
			this.metadata.result.loser = loser;
			this.metadata.result.endReason = 'Game abandoned by opponent';
		} else {
			// Both left? Or something else. Fallback.
			this.metadata.result.endReason = 'Game abandoned by players';
		}

		this.endGame(gamesList, true);
	}
	// Cleanup
	this.pauseTimer = null;
	this.pauseStartTime = null;
}
