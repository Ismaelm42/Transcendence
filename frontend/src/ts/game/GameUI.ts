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
		try
		{
			const response = await fetch("../../html/game/gameUI.html");
			if (!response.ok) throw new Error("Failed to load the game UI HTML file");
			
			const htmlContent = await response.text();
			appElement.innerHTML = htmlContent;
		}
		catch (error)
		{
			console.error("Error loading game UI:", error);
			appElement.innerHTML = `<div class="error-container">Failed to load game interface. Please try again.</div>`;
		}
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
