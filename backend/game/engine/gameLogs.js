/**
 * gameLogs.js file to gather game logs and CRUD DB related methods
 */

import { crud } from '../../crud/crud.js';

// Method to finalize the game and prepare data for storage
export function finalizeGame()
{
	// Log end time and game total duration
	this.metadata.endTime = Date.now();
	this.metadata.duration = this.metadata.endTime - this.metadata.startTime;
	this.metadata.result.finalScore = [...this.state.scores];
	
	// Determine winner and set result
	const p1Score = this.state.scores[0];
	const p2Score = this.state.scores[1];
	this.metadata.result.finalScore = [...this.state.scores];
	if (p1Score > p2Score)
	{
		this.metadata.result.winner = this.metadata.playerDetails.player1?.username || 'Player 1';
		this.metadata.result.loser = this.metadata.playerDetails.player2?.username || 'Player 2';
	}
	else
	{
		this.metadata.result.winner = this.metadata.playerDetails.player2?.username || 'Player 2';
		this.metadata.result.loser = this.metadata.playerDetails.player1?.username || 'Player 1';
	}
	
	return (this.getGamelogData());
}

// Method to prepare data for gamelog storage
export function getGamelogData()
{
	return {
		user1: this.metadata.playerDetails.player1?.id,
		user2: this.metadata.playerDetails.player2?.id,
		winner: this.metadata.result.winner?.id,
		loser: this.metadata.result.loser?.id,
		duration: this.metadata.duration,
		tournamentId: this.metadata.tournamentId
	};
}

// Function to save game data to database using the existing CRUD methods
export async function saveGameToDatabase(gameData)
{
	try
	{
		await crud.gamelog.createGamelog(
			gameData.user1,
			gameData.user2, 
			gameData.winner,
			gameData.loser,
			gameData.duration,
			gameData.tournamentId
		);
		console.log("Game saved to database successfully");
	}
	catch (error) {
		console.error("Failed to save game to database:", error);
	}
}