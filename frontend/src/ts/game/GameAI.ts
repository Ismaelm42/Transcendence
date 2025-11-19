import Game from './Game.js';

export class GameAI 
{
	private		game: Game;
	private		intervalId: number | null = null;
	private		errorFactor: number = 0.08;
	private		aiSide: 'player1' | 'player2' | null;

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
		
		if (this.game.getGameLog().config?.difficulty === 'easy')
			this.errorFactor = 0.09;
		else if (this.game.getGameLog().config?.difficulty === 'hard')
			this.errorFactor = 0.06;
		const	ballY = gameState.ball?.y ?? 0.5;
		const	paddleY = gameState.paddles[this.aiSide].y ?? 0.5;
		let		up = false, down = false;
		
		if (ballY < paddleY - this.errorFactor)
			up = true;
		else if (ballY > paddleY + this.errorFactor)
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
}
