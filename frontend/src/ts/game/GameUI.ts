/**
 * GameUI.ts -> UI setup and event listeners
 */

export class GameUI
{
	private	game: any;
	private	keydownListener: ((e: KeyboardEvent) => void) | null = null;
	private keyupListener: ((e: KeyboardEvent) => void) | null = null;
	
	constructor(game: any)
	{
		this.game = game;
	}

	async initializeUI(appElement: HTMLElement): Promise<void> {
		appElement.innerHTML = `
			<!-- Game setup - config -->
			<div class="select-game" id="select-game" style="display: block;">
				<h1 class="text-center text-white mb-4 text-4xl font-bold font-[Tektur]">Select Game Mode</h1>
				<div class="flex flex-col gap-4 items-center">
					<button id="play-1v1" style="width: 200px" class="h-12 py-3 bg-green-500 text-white border-none rounded hover:bg-green-600 font-bold cursor-pointer text-base flex justify-center items-center">Play 1v1</button>
					<button id="play-ai" style="width: 200px" class="h-12 py-3 bg-blue-500 text-white border-none rounded hover:bg-blue-600 font-bold cursor-pointer text-base flex justify-center items-center">Play vs AI</button>
					<button id="play-online" style="width: 200px" class="h-12 py-3 bg-green-500 text-white border-none rounded hover:bg-green-600 font-bold cursor-pointer text-base flex justify-center items-center">Play Online</button>
					<button id="play-ai" style="width: 200px" class="h-12 py-3 bg-blue-600 text-white border-none rounded hover:bg-blue-400 font-bold cursor-pointer text-base flex justify-center items-center">Tournament!</button>
				</div>
			</div>
			<div class="game-container" id="game-container" style="display: none; width: 100%; max-width: 1200px; margin: 0 auto; text-align: center;">
				<canvas id="game-canvas" width="800" height="600" style="background-color: black; margin: 0 auto; display: block; max-width: 100%; height: auto;"></canvas>
			</div>
		`;
	}

	// Sets up event listeners for game mode buttons, which after will also set controllers event listeners
	setupEventListeners()
	{
		// Game mode buttons
		document.getElementById('play-ai')?.addEventListener('click', () => {
			this.setupControllers('1vAI');
			this.joinGame('1vAI');
		});
		document.getElementById('play-1v1')?.addEventListener('click', () => {
			this.setupControllers('1v1');
			this.joinGame('1v1');
		});
		document.getElementById('play-online')?.addEventListener('click', () => {
			this.setupControllers('remote');
			this.joinGame('remote');
		});
		// Add tournament button listener if finally implemented here
	}

	// Sets up event listeners for game mode buttons, which after will also set controllers event listeners
	setupControllers(mode: string)
	{
		// Clear previous listeners
		if (this.keydownListener && this.keyupListener)
		{
			document.removeEventListener('keydown', this.keydownListener);
			document.removeEventListener('keyup', this.keyupListener);
		}
	
		// Track the state of all keys
		const keyState = {
			w: false,
			s: false,
			ArrowUp: false,
			ArrowDown: false
		};
	
		// Handler for key down events
		this.keydownListener = (e: KeyboardEvent) => {
			if (!this.game.connection.socket) return;
			
			const key = e.key.toLowerCase();
			
			// Only handle keys we care about
			if (key === 'w' || key === 's' || key === 'arrowup' || key === 'arrowdown') {
				// Update key state
				if (key === 'arrowup') {
					keyState.ArrowUp = true;  // Use dot notation with correct case
				} else if (key === 'arrowdown') {
					keyState.ArrowDown = true;  // Use dot notation with correct case
				} else {
					keyState[key] = true;  // For w and s, bracket notation is fine
				}
				
				// Send updates for player 1 (W/S keys)
				if (key === 'w' || key === 's') {
					this.game.connection.socket.send(JSON.stringify({
						type: 'PLAYER_INPUT',
						input: {
							player: 'player1',
							up: keyState.w,
							down: keyState.s
						}
					}));
				}
				
				// Send updates for player 2 (Arrow keys) - only in 1v1 mode
				if (mode === '1v1' && (key === 'arrowup' || key === 'arrowdown')) {
					this.game.connection.socket.send(JSON.stringify({
						type: 'PLAYER_INPUT',
						input: {
							player: 'player2',
							up: keyState.ArrowUp,
							down: keyState.ArrowDown
						}
					}));
				}
			}
		};
		
		// Handler for key up events
		this.keyupListener = (e: KeyboardEvent) => {
			if (!this.game.connection.socket) return;
			
			const key = e.key.toLowerCase();
			
			// Only handle keys we care about
			if (key === 'w' || key === 's' || key === 'arrowup' || key === 'arrowdown') {
				// Update key state
				if (key === 'arrowup') {
					keyState.ArrowUp = false;  // Use dot notation with correct case
				} else if (key === 'arrowdown') {
					keyState.ArrowDown = false;  // Use dot notation with correct case
				} else {
					keyState[key] = false;  // For w and s, bracket notation is fine
				}
				
				// Send updates for player 1 (W/S keys)
				if (key === 'w' || key === 's') {
					this.game.connection.socket.send(JSON.stringify({
						type: 'PLAYER_INPUT',
						input: {
							player: 'player1',
							up: keyState.w,
							down: keyState.s
						}
					}));
				}
				
				// Send updates for player 2 (Arrow keys) - only in 1v1 mode
				if (mode === '1v1' && (key === 'arrowup' || key === 'arrowdown')) {
					this.game.connection.socket.send(JSON.stringify({
						type: 'PLAYER_INPUT',
						input: {
							player: 'player2',
							up: keyState.ArrowUp,
							down: keyState.ArrowDown
						}
					}));
				}
			}
		};
		
		// Add both event listeners
		document.addEventListener('keydown', this.keydownListener);
		document.addEventListener('keyup', this.keyupListener);
	}

	joinGame(mode: string)
	{
		if (!this.game.connection.socket || !this.game.connection.connectionStat)
		{
			console.error("Cannot join game: connection not ready");
			return;
		}
		this.game.mode = mode;
		console.log(`Requesting to join ${mode} game...`);
		this.game.connection.socket.send(JSON.stringify({
			type: 'JOIN_GAME',
			mode: mode
		}));
		const	selectGame = document.getElementById('select-game');
		const	gameDiv = document.getElementById('game-container');
		if (selectGame)
			selectGame.style.display = "none";
		if (gameDiv)
			gameDiv.style.display = "block";
		this.game.renderer.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
		if (this.game.renderer.canvas)
			this.game.renderer.ctx = this.game.renderer.canvas.getContext('2d');
	}
}
