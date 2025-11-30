/**
 * gameLogs.js file to gather game logs and CRUD DB related methods
 */

// Method to finalize the game and prepare data for storage
export function finalizeGame() {
	// Log end time and game total duration
	this.metadata.endTime = Date.now();
	this.metadata.duration = this.metadata.endTime - this.metadata.startTime;
	this.metadata.result.finalScore = [...this.state.scores];

	// Determine winner and set result
	// Determine winner and set result
	// If winner is already set (e.g. by disconnect), skip score check
	if (this.metadata.result.winner)
		return (this.getGamelogData());

	const p1Score = this.state.scores[0];
	const p2Score = this.state.scores[1];
	this.metadata.result.finalScore = [...this.state.scores];
	if (p1Score > p2Score) {
		this.metadata.result.winner = this.metadata.playerDetails.player1;
		this.metadata.result.loser = this.metadata.playerDetails.player2;
	}
	else {
		this.metadata.result.winner = this.metadata.playerDetails.player2;
		this.metadata.result.loser = this.metadata.playerDetails.player1;
	}
	return (this.getGamelogData());
}

// Method to prepare data for gamelog storage
export function getGamelogData() {
	return {
		user1: this.metadata.playerDetails.player1?.id,
		user2: this.metadata.playerDetails.player2?.id,
		winner: this.metadata.result.winner?.id,
		loser: this.metadata.result.loser?.id,
		duration: this.metadata.duration,
		tournamentId: this.metadata.tournamentId
	};
}
