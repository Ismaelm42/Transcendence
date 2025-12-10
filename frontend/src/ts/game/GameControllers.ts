/**
 * GameControllers.ts -> Handles all input and controller logic for the game
 * This is an auxiliar component to keep GameUI shorter and better readable
 */

import Game from './Game.js'

export class GameControllers
{
	private game: Game;
	private keyState = { w: false, s: false, ArrowUp: false, ArrowDown: false };
	private keydownListener: ((e: KeyboardEvent) => void);
	private keyupListener: ((e: KeyboardEvent) => void);
	private inputInterval: number | null = null;
	private listenersActive = false;
	private	aiSide: 'player1' | 'player2' | null = null;

	constructor(game: Game, aiSide: 'player1' | 'player2' | null )
	{
		this.game = game;
		this.keydownListener = this.handleKeyDown.bind(this);
		this.keyupListener = this.handleKeyUp.bind(this);
		this.aiSide = aiSide;
	}

	private handleKeyDown(e: KeyboardEvent)
	{
        const key = e.key.toLowerCase();
		const Wkey = document.getElementById('w_key');
		const Skey = document.getElementById('s_key');
		const Upkey = document.getElementById('up_key');
		const Downkey = document.getElementById('down_key');
        let keyChanged = false;
        if (key === 'w' && !this.keyState.w) { this.keyState.w = true; keyChanged = true; Wkey?.classList.add('bg-candlelight-500'); }
        else if (key === 's' && !this.keyState.s) { this.keyState.s = true; keyChanged = true; Skey?.classList.add('bg-candlelight-500'); }
        else if (key === 'arrowup' && !this.keyState.ArrowUp) { this.keyState.ArrowUp = true; keyChanged = true; Upkey?.classList.add('bg-candlelight-500'); }
        else if (key === 'arrowdown' && !this.keyState.ArrowDown) { this.keyState.ArrowDown = true; keyChanged = true; Downkey?.classList.add('bg-candlelight-500'); }
        if (keyChanged && (this.keyState.w || this.keyState.s || this.keyState.ArrowUp || this.keyState.ArrowDown))
            this.startSendingInputs();
    }

    private handleKeyUp(e: KeyboardEvent)
	{
		
        const key = e.key.toLowerCase();
		const Wkey = document.getElementById('w_key');
		const Skey = document.getElementById('s_key');
		const Upkey = document.getElementById('up_key');
		const Downkey = document.getElementById('down_key');
        if (key === 'w') {this.keyState.w = false; Wkey?.classList.remove('bg-candlelight-500'); }
        else if (key === 's') {this.keyState.s = false; Skey?.classList.remove('bg-candlelight-500'); }
        else if (key === 'arrowup') {this.keyState.ArrowUp = false;Upkey?.classList.remove('bg-candlelight-500'); }
        else if (key === 'arrowdown') {this.keyState.ArrowDown = false; Downkey?.classList.remove('bg-candlelight-500'); }
        if (!this.keyState.w && !this.keyState.s && !this.keyState.ArrowUp && !this.keyState.ArrowDown)
            this.stopSendingInputs();
    }

	private	startSendingInputs()
	{
		// Only start if we haven't already
		if (this.inputInterval)
			return;
		// Send inputs (60fps)
		this.inputInterval = window.setInterval(() => {
			if (!this.game.getGameConnection().socket)
				return ;
			
			// On 1vAI - Fix controls for human side (not always player1 as before)
			if (this.aiSide)
			{
				const humanSide = this.aiSide === 'player1' ? 'player2' : 'player1';
				if (humanSide === 'player1')
				{
					this.game.getGameConnection().socket?.send(JSON.stringify({
						type: 'PLAYER_INPUT',
						input: {
							player: 'player1',
							up: this.keyState.w,
							down: this.keyState.s
						}
					}));
				}
				else if (humanSide === 'player2')
				{
					this.game.getGameConnection().socket?.send(JSON.stringify({
						type: 'PLAYER_INPUT',
						input: {
							player: 'player2',
							up: this.keyState.ArrowUp,
							down: this.keyState.ArrowDown
						}
					}));
				}
			}
			else
			{
				// Set player1 control ipunt - On regular game or Remote being HOST / GAME CREATOR
				if (this.game.getGameIsHost() || this.game.getGameLog().tournamentId)
				{
					this.game.getGameConnection().socket?.send(JSON.stringify({
						type: 'PLAYER_INPUT',
						input: {
							player: 'player1',
							up: this.keyState.w,
							down: this.keyState.s
						}
					}));
				}
				// Allow player2 input if 1v1 mode or remote game joined (not being HOST / CREATOR)
				if (this.game.getGameLog().mode === '1v1'
					|| (this.game.getGameLog().mode === 'remote' && !this.game.getGameIsHost()))
				{
					this.game.getGameConnection().socket?.send(JSON.stringify({
						type: 'PLAYER_INPUT',
						input: {
							player: 'player2',
							up: this.keyState.ArrowUp,
							down:this. keyState.ArrowDown
						}
					}));
				}
			}
		}, 16);
	};

	private stopSendingInputs()
	{
		if (this.inputInterval)
		{
			window.clearInterval(this.inputInterval);
			this.inputInterval = null;
		}
	};

	/**
	 * Set up keyboard controllers for different game modes
	 * @param mode Game mode ('1vAI', '1v1', 'remote')
	 * @returns Cleanup function
	 */
	setupControllers()
	{
		this.cleanup();
		if(!this.listenersActive)
		{
			document.addEventListener('keydown', this.keydownListener);
			document.addEventListener('keyup', this.keyupListener);
			this.listenersActive = true;
		}
	}

	/**
	 * Aux method to clean all controller listeners and resources such as intervals
	 */
	public cleanup()
	{
		window.clearInterval(this.inputInterval!);
		if (this.listenersActive)
		{
			document.removeEventListener('keydown', this.keydownListener);
			document.removeEventListener('keyup', this.keyupListener);
			this.listenersActive = false;
		}
	}

	public destroy()
	{
		this.cleanup();
		this.game = null as any;
	}
}
