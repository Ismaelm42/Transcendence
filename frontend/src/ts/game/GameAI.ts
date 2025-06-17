import Game from './Game.js';

export class GameAI 
{
	private		game: Game;
	private		intervalId: number | null = null;
	private		errorFactor: number = 0.08;

	constructor(game: Game)
	{
		this.game = game;
	}

	start()
	{
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
		if (!gameState || !this.game.getGameConnection().socket)
			return ;
		
		if (this.game.getGameLog().config?.difficulty === 'easy')
			this.errorFactor = 0.09;
		else if (this.game.getGameLog().config?.difficulty === 'hard')
			this.errorFactor = 0.06;
		const	ballY = gameState.ball?.y ?? 0.5;
		const	paddleY = gameState.paddles.player2?.y ?? 0.5;
		let		up = false, down = false;
		
		if (ballY < paddleY - this.errorFactor)
			up = true;
		else if (ballY > paddleY + this.errorFactor)
			down = true;

		this.game.getGameConnection().socket?.send(JSON.stringify({
			type: 'PLAYER_INPUT',
			input: {
				player: 'player2',
				up,
				down
			}
		}));
	}
}
