# AI Implementation Update

## Requirement
"The AI can only refresh its view of the game once per second, requiring it to anticipate bounces and other actions."

## Changes Implemented

### 1. Velocity Tracking
The AI now calculates the ball's velocity (`lastVelocity`) by comparing the current game state with the previous frame's state. This is essential for prediction.

### 2. 1Hz Decision Loop
A timer mechanism (`lastDecisionTime`) was added to restrict the AI's "view" refresh to once every 1000ms (1 second).
- **Before**: The AI checked the ball position every 16ms and moved immediately.
- **After**: The AI calculates a new target position only when `Date.now() - lastDecisionTime >= 1000`.

### 3. Bounce Anticipation (Prediction)
Since the AI is blind for 1 second, it must predict where the ball will be. The `calculateTarget` method:
- Calculates the time (ticks) until the ball reaches the AI's paddle x-coordinate.
- Extrapolates the ball's y-coordinate based on its current velocity.
- Simulates bounces off the top (0) and bottom (1) walls to find the final y-position.

### 4. Smooth Execution
While the *decision* is made once per second, the `update` loop still runs at 60Hz to smoothly move the paddle towards the calculated `targetY`.

## Updated Code (`GameAI.ts`)

```typescript
import Game from './Game.js';

export class GameAI 
{
	private		game: Game;
	private		intervalId: number | null = null;
	private		errorFactor: number = 0.08;
	private		aiSide: 'player1' | 'player2' | null;
	private		lastDecisionTime: number = 0;
	private		targetY: number = 0.5;
	private		lastState: any = null;
	private		lastVelocity: { x: number, y: number } | null = null;

	constructor(game: Game, aiSide: 'player1' | 'player2' | null)
	{
		this.game = game;
		this.aiSide = aiSide;
	}

	start()
	{
		// Avoid duplicate intervals on reconnect/resume
		if (this.intervalId)
			return;
		this.lastDecisionTime = 0;
		this.intervalId = window.setInterval(() => this.update(), 16);
	}

	stop()
	{
		if (this.intervalId)
		{
			window.clearInterval(this.intervalId);
			this.intervalId = null;
		}
	}

	private update()
	{
		const	gameState = this.game.getGameRender().gameState;
		if (!gameState || !this.game.getGameConnection().socket || !this.aiSide)
			return ;
		
		// Track velocity
		if (this.lastState && this.lastState !== gameState)
		{
			const dx = gameState.ball.x - this.lastState.ball.x;
			const dy = gameState.ball.y - this.lastState.ball.y;
			if (Math.abs(dx) > 0.00001 || Math.abs(dy) > 0.00001)
				this.lastVelocity = { x: dx, y: dy };
		}
		this.lastState = gameState;

		// Decision logic (1Hz)
		const now = Date.now();
		if (now - this.lastDecisionTime >= 1000)
		{
			this.calculateTarget(gameState);
			this.lastDecisionTime = now;
		}
		
		if (this.game.getGameLog().config?.difficulty === 'easy')
			this.errorFactor = 0.11;
		else if (this.game.getGameLog().config?.difficulty === 'hard')
			this.errorFactor = 0.06;

		const	paddleY = gameState.paddles[this.aiSide].y ?? 0.5;
		let		up = false, down = false;
		
		if (this.targetY < paddleY - this.errorFactor)
			up = true;
		else if (this.targetY > paddleY + this.errorFactor)
			down = true;

		this.game.getGameConnection().socket?.send(JSON.stringify({
			type: 'PLAYER_INPUT',
			input: {
				player: this.aiSide,
				up,
				down
			}
		}));
	}

	private calculateTarget(gameState: any)
	{
		if (!this.lastVelocity || Math.abs(this.lastVelocity.x) < 0.00001)
		{
			this.targetY = gameState.ball.y;
			return;
		}

		const paddleX = (this.aiSide === 'player1') ? 0.03 : 0.97;
		const dist = paddleX - gameState.ball.x;
		const ticks = dist / this.lastVelocity.x;

		if (ticks < 0)
		{
			this.targetY = 0.5;
			return;
		}

		let predictedY = gameState.ball.y + (this.lastVelocity.y * ticks);

		while (predictedY < 0 || predictedY > 1)
		{
			if (predictedY < 0) predictedY = -predictedY;
			if (predictedY > 1) predictedY = 2 - predictedY;
		}
		this.targetY = predictedY;
	}
}
```

# Game Duration Fix

## Issue
When a remote game was aborted before the actual game loop started (i.e., before `startTime` was set), the game over message displayed a strange time value (e.g., `4545451564:23:01`) because the duration was calculated as `Date.now() - 0`.

## Fix
Modified `endGameSession` in `frontend/src/ts/game/Game.ts` to check if `startTime` is 0. If so, the duration is set to 0.

## Updated Code (`Game.ts`)

```typescript
public endGameSession(result: { winner: string, loser: string, score: [number, number], endReason: string }): void {
	if (this.log.startTime === 0)
		this.log.duration = 0;
	else
		this.log.duration = Date.now() - this.log.startTime;
	this.log.result = result;
	console.log("Game session ended:", this.log);
	this.renderer.stopRenderLoop();
	this.log.readyState = false;
}
```
