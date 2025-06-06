/**
 * GameRender.ts -> Rendering related methods
 */

import Game from './Game.js'

export class GameRender
{
	private game: any;
	public canvas: HTMLCanvasElement | null = null;
	public ctx: CanvasRenderingContext2D | null = null;
	public animationFrameId: number | null = null;
	public gameState: any | null = null;
	public lastKnownState: any | null = null;
	public stateTimestamp: number = 0;

	constructor(game: Game)
	{
		this.game = game;
	}

	renderGameState(state: any)
	{
		console.log("Received new game state:", state);
		this.lastKnownState = this.game.gameState;
		this.gameState = state;
		this.stateTimestamp = Date.now();
		if (!this.canvas)
		{
			console.log("Canvas not found, attempting to initialize");
			this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
			if (this.canvas)
			{
				console.log("Canvas found with dimensions:", this.canvas.width, "x", this.canvas.height);
				this.ctx = this.canvas.getContext('2d');
				if (!this.ctx)
				{
					console.error("Failed to get canvas context");
					return;
				}
				// Start the animation loop if this is the first state update
				this.startRenderLoop();
			}
			else
			{
				console.error("Could not find canvas element");
				return;
			}
		}
		// Force a redraw with the new state
		this.drawGame();
	}

	private startRenderLoop()
	{
		// Cancel any existing animation frame
		if (this.animationFrameId !== null)
			cancelAnimationFrame(this.animationFrameId);
		const renderLoop = () => {
			this.drawGame();
			this.animationFrameId = requestAnimationFrame(renderLoop);
		};
		this.animationFrameId = requestAnimationFrame(renderLoop);
	}

	private drawGame()
	{
		if (!this.ctx || !this.canvas)
		{
			console.error("Cannot draw: missing context or canvas");
			return ;
		}
		if (!this.gameState)
		{
			console.error("Cannot draw: missing game state");
			return ;
		}
		console.log("Drawing game with state:", this.gameState);
		// Clear the canvas
		this.ctx.fillStyle = "black";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		// Draw elements
		this.drawCenterLine();
		this.drawPaddles();
		this.drawBall();
		this.drawScore();
	}

	private drawPaddles()
	{
		if (!this.ctx || !this.canvas || !this.gameState || !this.gameState.paddles)
		{
			console.error("Cannot draw paddles");
			return ;
		}
		// Draw paddles with measures relative to canvas size - must match same on the backend(!)
		const paddleWidth = Math.round(this.canvas.width * 0.025);
		const paddleHeight = Math.round(this.canvas.height * 0.15);
		const leftPaddleX = Math.round(this.canvas.width * 0.03);
		const rightPaddleX = Math.round(this.canvas.width * 0.97) - paddleWidth;
		this.ctx.fillStyle = "white";
		
		// Draw left paddle (player1)
		if (this.gameState.paddles.player1)
		{
			const y = this.gameState.paddles.player1.y * this.canvas.height;
			const leftPaddleY = Math.round(y - (paddleHeight / 2));
			this.ctx.fillRect(leftPaddleX, leftPaddleY, paddleWidth, paddleHeight);
		}
		// Draw right paddle (player2)
		if (this.gameState.paddles.player2)
		{
			const y = this.gameState.paddles.player2.y * this.canvas.height;
			const rightPaddleY = Math.round(y - (paddleHeight / 2));
			this.ctx.fillRect(rightPaddleX, rightPaddleY, paddleWidth, paddleHeight);
		}
	}

	private drawBall()
	{
		if (!this.ctx || !this.canvas || !this.gameState || !this.gameState.ball)
		{
			console.error("Cannot draw ball");
			return;
		}
		// Ball position is in normalized coordinates (0-1 range)
		const ballX = this.gameState.ball.x * this.canvas.width;
		const ballY = this.gameState.ball.y * this.canvas.height;
		// Keep the ball radius consistent with backend collision detection - must match same on the backend(!)
		const ballRadius = Math.round(this.canvas.height * 0.015);
		
		// Draw a highlight circle to better visualize the ball's collision boundary
		this.ctx.beginPath();
		this.ctx.arc(ballX, ballY, ballRadius + 1, 0, Math.PI * 2);
		this.ctx.fillStyle = "rgba(255, 255, 255, 0.3)"; // Semi-transparent white
		this.ctx.fill();
		this.ctx.closePath();

		// Draw the main ball
		this.ctx.beginPath();
		this.ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
		this.ctx.fillStyle = "white";
		this.ctx.fill();
		this.ctx.closePath();
	}

	private drawScore()
	{
		if (!this.ctx || !this.canvas || !this.gameState || !this.gameState.scores)
		{
			console.error("Cannot draw scores:");
			return ;
		}
		const player1Score = this.gameState.scores[0];
    	const player2Score = this.gameState.scores[1];
		this.ctx.fillStyle = "white";
		this.ctx.font = "60px Tektur, sans-serif";
		// Position scores on their respective sides (about 25% in from each edge and 80 from top)
		const leftScoreX = Math.round(this.canvas.width * 0.25);
		const rightScoreX = Math.round(this.canvas.width * 0.75);
		const scoreY = 80;
		this.ctx.textAlign = "center";
		this.ctx.fillText(`${player1Score}`, leftScoreX, scoreY);
    	this.ctx.fillText(`${player2Score}`, rightScoreX, scoreY);
	}

	private drawCenterLine()
	{
		if (!this.ctx || !this.canvas)
			return;
		
		this.ctx.strokeStyle = 'white';
		this.ctx.setLineDash([10, 10]);
		this.ctx.beginPath();
		this.ctx.moveTo(this.canvas.width / 2, 0);
		this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
		this.ctx.stroke();
		this.ctx.setLineDash([]);
	}

	public stopRenderLoop(): void
	{
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
	}

	public destroy()
	{
		if (this.animationFrameId !== null)
		{
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
	}
}
