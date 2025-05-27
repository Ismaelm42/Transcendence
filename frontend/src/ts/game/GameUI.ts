/**
 * GameUI.ts -> UI setup and event listeners
 */

import { GameControllers } from './GameControllers.js';

export class GameUI
{
	private	game: any;
	private controllers: GameControllers;
	
	constructor(game: any)
	{
		this.game = game;
		this.controllers = new GameControllers(game);
	}

	async initializeUI(appElement: HTMLElement): Promise<void>
	{
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

	// Sets up event listeners for game mode buttons, which after will also set controllers
	setupEventListeners()
	{
		// Game mode buttons
		document.getElementById('play-ai')?.addEventListener('click', () => {
			this.controllers.setupControllers('1vAI');
			this.joinGame('1vAI');
		});
		document.getElementById('play-1v1')?.addEventListener('click', () => {
			this.controllers.setupControllers('1v1');
			this.joinGame('1v1');
		});
		document.getElementById('play-online')?.addEventListener('click', () => {
			this.controllers.setupControllers('remote');
			this.joinGame('remote');
		});
		// Add tournament button listener if finally implemented here
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
