/**
 * GameControllers.ts -> Handles all input and controller logic for the game
 * This is an auxiliar component to keep GameUI shorter and better readable
 */

import Game from './Game.js'

export class GameControllers
{
	private game: Game;
	private keydownListener: ((e: KeyboardEvent) => void) | null = null;
	private keyupListener: ((e: KeyboardEvent) => void) | null = null;
	private inputInterval: number | null = null;

	constructor(game: Game)
	{
		this.game = game;
	}
	/**
	 * Set up keyboard controllers for different game modes
	 * @param mode Game mode ('1vAI', '1v1', 'remote')
	 * @returns Cleanup function
	 */
	setupControllers(mode: string)
	{
		// Clear any existing controller resources first
		this.cleanup();
		// Track the state needed control keys
		const keyState = { w: false, s: false, ArrowUp: false, ArrowDown: false	};
		// Set an interval to continuously send input state - ensures smooth movement when multiple keys pressed
		let inputInterval: number | null = null;
		const startSendingInputs = () => {
			// Only start if we haven't already
			if (inputInterval)
				return;
			// Send inputs (60fps)
			inputInterval = window.setInterval(() => {
				if (!this.game.getGameConnection().socket)
					return ;
				// Always send player1 input
				this.game.getGameConnection().socket?.send(JSON.stringify({
					type: 'PLAYER_INPUT',
					input: {
						player: 'player1',
						up: keyState.w,
						down: keyState.s
					}
				}));
				// Send player2 input if 1v1 mode
				if (mode === '1v1')
				{
					this.game.getGameConnection().socket?.send(JSON.stringify({
						type: 'PLAYER_INPUT',
						input: {
							player: 'player2',
							up: keyState.ArrowUp,
							down: keyState.ArrowDown
						}
					}));
				}
			}, 16);
		};
		
		const stopSendingInputs = () => {
			if (inputInterval)
			{
				window.clearInterval(inputInterval);
				inputInterval = null;
			}
		};
	
		// Handler for key down events
		this.keydownListener = (e: KeyboardEvent) => {
			const key = e.key.toLowerCase();
			let keyChanged = false;
			// Update key state
			if (key === 'w' && !keyState.w)
			{
				keyState.w = true;
				keyChanged = true;
			} 
			else if (key === 's' && !keyState.s)
				{
				keyState.s = true;
				keyChanged = true;
			}
			else if (key === 'arrowup' && !keyState.ArrowUp)
			{
				keyState.ArrowUp = true;
				keyChanged = true;
			}
			else if (key === 'arrowdown' && !keyState.ArrowDown)
			{
				keyState.ArrowDown = true;
				keyChanged = true;
			}
			// If this is the first key pressed, start sending inputs
			if (keyChanged && (keyState.w || keyState.s || keyState.ArrowUp || keyState.ArrowDown))
				startSendingInputs();
		};
		
		// Handler for key up events
		this.keyupListener = (e: KeyboardEvent) => {
			const key = e.key.toLowerCase();
			// Update key state
			if (key === 'w')
				keyState.w = false;
			else if (key === 's')
				keyState.s = false;
			else if (key === 'arrowup')
				keyState.ArrowUp = false;
			else if (key === 'arrowdown')
				keyState.ArrowDown = false;
			// If no keys are pressed, stop sending inputs
			if (!keyState.w && !keyState.s && !keyState.ArrowUp && !keyState.ArrowDown)
				stopSendingInputs();
		};
		
		// Add both event listeners to the browser
		document.addEventListener('keydown', this.keydownListener);
		document.addEventListener('keyup', this.keyupListener);
	}

	/**
	 * Aux method to clean all controller listeners and resources such as intervals
	 */
	public cleanup()
	{
		if (this.inputInterval)
		{
			window.clearInterval(this.inputInterval);
			this.inputInterval = null;
		}
		if (this.keydownListener)
		{
			document.removeEventListener('keydown', this.keydownListener);
			this.keydownListener = null;
		}
		if (this.keyupListener)
		{
			document.removeEventListener('keyup', this.keyupListener);
			this.keyupListener = null;
		}
	}
	}