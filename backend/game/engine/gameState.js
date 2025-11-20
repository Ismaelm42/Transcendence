/**
 * gameState.js file:
 * 	- Game state elements managment related functions
 */

import { gamesList } from "../manager/eventManager.js";
import { createGamelog } from '../../crud/gamelog.js';
import { deleteTempuserByTournamentId } from '../../crud/tempuser.js';


//Set game difficulty which affects AI behavior and ball speed
export function setDifficulty(level)
{
	this.difficulty = level;
	this.metadata.config.difficulty = level;

	if (level === 'easy')
		this.ballSpeedMultiplier = 1.25;
	else if (level === 'hard')
		this.ballSpeedMultiplier = 1.75;

	// Update ball speed if game is in progress
	if (this.state.ball)
	{
		const currentSpeed = Math.sqrt(this.state.ball.dx * this.state.ball.dx + 
										this.state.ball.dy * this.state.ball.dy);
		const normalizedDx = this.state.ball.dx / currentSpeed;
		const normalizedDy = this.state.ball.dy / currentSpeed;
		
		const newSpeed = 0.2 * this.ballSpeedMultiplier;
		this.state.ball.dx = normalizedDx * newSpeed;
		this.state.ball.dy = normalizedDy * newSpeed;
	}
	
	console.log(`Game ${this.roomId} difficulty set to: ${level}`);
}

// Initialize or reset game elements positions
export function resetState()
{
	return {
		ball: { x: 0.5, y: 0.5, dx: 0.20 * this.ballSpeedMultiplier, dy: 0.06 * this.ballSpeedMultiplier },
		paddles: {
			player1: { y: 0.5 },
			player2: { y: 0.5 }
		},
		scores: [0, 0]
	};
}

// Update game state struct -> elements values/positions + score
export function update(deltaTime)
{
	// Ball movement with appropriate clamping
	this.state.ball.x += this.state.ball.dx * deltaTime;
	this.state.ball.y += this.state.ball.dy * deltaTime;

	// Wall collisions (top/bottom) + small buffer (0.01) to prevent ball getting stuck
	if (this.state.ball.y <= 0.01)
	{
		this.state.ball.y = 0.01;
		this.state.ball.dy = Math.abs(this.state.ball.dy);
	} 
	else if (this.state.ball.y >= 0.99)
	{
		this.state.ball.y = 0.99;
		this.state.ball.dy = -Math.abs(this.state.ball.dy);
	}
	this.checkPaddleCollision('player1');
	this.checkPaddleCollision('player2');
	this.checkScoring(gamesList);
}

// Check if ball has scored on one side and update players scores if so
export function checkScoring(gamesList)
{
	// Skip scoring check if already in reset phase
	if (this.isResetting)
		return;

	const ball = this.state.ball;
	// Player 1 scores (ball passes right edge)
	if (ball.x >= 1)
	{
		this.state.scores[0]++;
		this.isResetting = true;
		// Freeze the ball
		this.state.ball.dx = 0;
		this.state.ball.dy = 0;
		// Reset after delay
		setTimeout(() => {
			this.resetBall('right');
			this.isResetting = false;
		}, 1000);
	}
	// Player 2 scores (ball passes left edge)
	else if (ball.x <= 0)
	{
		this.state.scores[1]++;
		this.isResetting = true;
		// Freeze the ball
		this.state.ball.dx = 0;
		this.state.ball.dy = 0;
		// Reset after delay
		setTimeout(() => {
			this.resetBall('left');
			this.isResetting = false;
		}, 1000);
	}
	// Check if the winScore has been reached to end the game
	if (this.state.scores[0] >= this.winScore || this.state.scores[1] >= this.winScore)
		this.endGame(gamesList, true);
}

// Clean finish for game + call logs/DB methods for storing and/or showing info on front side
export async function endGame(gamesList, needSaving)
{
	this.isFinished = true;
	clearTimeout(this.pauseTimer);
	//clearTimeout(this.resumeTimeout);
	const gamelogData = this.finalizeGame();
	clearInterval(this.gameLoop);
	clearInterval(this.aiInterval);
	// Save gamelog on DB if game ended normally
	if (needSaving)
	{
		try
		{
			await createGamelog(gamelogData);
			console.warn('GameLog succesfully saved to DB');
		} catch (err) {
			console.error('Error saving gamelog:', err);
		}
	}
	// Remove gameSession from map if we are on tournament game or game aborted  - no rematch possible
	if (gamesList && gamesList.has(this.roomId) && (this.metadata.tournamentId || !needSaving))
	{
		console.log("in-tournament or aborted game: deleting gameSession from map");
		gamesList.delete(this.roomId);
	}
	// Notify players
	this.broadcastResponse('GAME_END');
	this.shouldCleanup = true;
	console.log("[!]-_GAME SESSION STOPPED AND DELETED FROM BACKEND_-[!]");
	console.log("tournamentID:", this.metadata.tournamentId);
	if (this.metadata.tournamentId && this.metadata.tournamentId > 0)
	{	
		console.log("INSIDE IF - tournamentID:", this.metadata.tournamentId);
		deleteTempuserByTournamentId(this.metadata.tournamentId);
	}
}
