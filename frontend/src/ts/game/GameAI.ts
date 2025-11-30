import Game from './Game.js';

export class GameAI {
	private game: Game;
	private intervalId: number | null = null;
	private errorFactor: number = 0.08;
	private aiSide: 'player1' | 'player2' | null;
	private lastDecisionTime: number = 0;
	private targetY: number = 0.5;
	private lastState: any = null;
	private lastVelocity: { x: number, y: number } | null = null;

	constructor(game: Game, aiSide: 'player1' | 'player2' | null) {
		this.game = game;
		this.aiSide = aiSide;
	}

	start() {
		// Avoid duplicate intervals on reconnect/resume
		if (this.intervalId)
			return;
		this.lastDecisionTime = 0;
		this.intervalId = window.setInterval(() => this.update(), 16);
	}

	stop() {
		if (this.intervalId) {
			window.clearInterval(this.intervalId);
			this.intervalId = null;
		}
	}

	private update() {
		const gameState = this.game.getGameRender().gameState;
		if (!gameState || !this.game.getGameConnection().socket || !this.aiSide)
			return;

		// Track velocity
		if (this.lastState && this.lastState !== gameState) {
			const dx = gameState.ball.x - this.lastState.ball.x;
			const dy = gameState.ball.y - this.lastState.ball.y;
			if (Math.abs(dx) > 0.00001 || Math.abs(dy) > 0.00001)
				this.lastVelocity = { x: dx, y: dy };
		}
		this.lastState = gameState;

		// Decision logic (1Hz)
		const now = Date.now();
		if (now - this.lastDecisionTime >= 1000) {
			this.calculateTarget(gameState);
			this.lastDecisionTime = now;
		}

		if (this.game.getGameLog().config?.difficulty === 'easy')
			this.errorFactor = 0.16;
		else if (this.game.getGameLog().config?.difficulty === 'hard')
			this.errorFactor = 0.08;

		const paddleX = (this.aiSide === 'player1') ? 0.03 : 0.97;
		if (Math.abs(gameState.ball.x - paddleX) < 0.2)
			this.errorFactor = 0.01;

		const paddleY = gameState.paddles[this.aiSide].y ?? 0.5;
		let up = false, down = false;

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

	private calculateTarget(gameState: any) {
		if (!this.lastVelocity || Math.abs(this.lastVelocity.x) < 0.00001) {
			this.targetY = gameState.ball.y;
			return;
		}

		const paddleX = (this.aiSide === 'player1') ? 0.03 : 0.97;
		const dist = paddleX - gameState.ball.x;
		const ticks = dist / this.lastVelocity.x;

		if (ticks < 0) {
			this.targetY = 0.5;
			return;
		}

		let predictedY = gameState.ball.y + (this.lastVelocity.y * ticks);

		while (predictedY < 0 || predictedY > 1) {
			if (predictedY < 0) predictedY = -predictedY;
			if (predictedY > 1) predictedY = 2 - predictedY;
		}
		this.targetY = predictedY;
	}
}
