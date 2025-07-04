/**
 * GameMatch.ts -> canvas rendering, SPA step only for the match itself
 * 	it will rsetup listeners for controllers and render the game
 * 		+ showResults / rematch - back to lobby
 */

import { SPA } from '../spa/spa.js';
import Game from './Game.js'
import { GameConnection } from './GameConnection.js';
import { GameRender } from './GameRender.js';
import { GameUI } from './GameUI.js';
import { Step } from "../spa/stepRender.js";
import { GameControllers } from './GameControllers.js'
import { GameData, GameConfig, GamePlayer } from './types.js';
import { GameAI } from './GameAI.js';

export default class GameMatch extends Step
{
	private	game: Game;
	public	controllers: GameControllers;
	private log: GameData;
	private renderer: GameRender;
	private config: GameConfig;
	private	ui: GameUI;
	private	connection: GameConnection;
	private	ai: GameAI | null = null;

	constructor(game: Game)
	{
		super('game-container');
		this.game = game;
		this.renderer = game.getGameRender();
		this.controllers = new GameControllers(this.game);
		this.config = game.getGameConfig();
		this.log = game.getGameLog();
		this.ui = game.getGameUI();
		this.connection = game.getGameConnection();
		if (this.log.mode === '1vAI')
			this.ai = new GameAI(this.game);
	}

	async render(appElement: HTMLElement): Promise<void>
	{
		try
		{
			const response = await fetch("../../html/game/gameMatch.html");
			if (!response.ok)
				throw new Error("Failed to load the game UI HTML file");
			const htmlContent = await response.text();
			appElement.innerHTML = htmlContent;
		}
		catch (error)
		{
			console.error("Error loading game UI:", error);
			appElement.innerHTML = `<div class="error-container">Failed to load game interface. Please try again.</div>`;
		}
		const canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null;
		if (canvas)
		{
			this.renderer.canvas = canvas;
			this.renderer.ctx = canvas.getContext('2d');
			this.connection.socket?.send(JSON.stringify({ type: 'CLIENT_READY' }));
		}
		if (this.ai)
			this.ai.start();
		this.controllers.setupControllers();
	}
	
	/**
	 * Display game results when a game ends
	 * @param gameData Complete game data
	 */
	public showGameResults(gameData: GameData): void
	{
		// Update the HTML content with actual game data logs
		const winnerElement = document.getElementById('winner-name');
		const scoreElement = document.getElementById('final-score');
		const durationElement = document.getElementById('game-duration');
		if (winnerElement)
			winnerElement.textContent = gameData.result?.winner || 'Unknown';
		if (scoreElement)
		{
			const score = gameData.result?.score || [0, 0];
			scoreElement.textContent = `${score[0]} - ${score[1]}`;
		}
		if (durationElement)
		{
			const duration = gameData.duration ? Math.floor(gameData.duration / 1000) : 0;
			durationElement.textContent = duration.toString();
		}
		const	playAgainBtn = document.getElementById('play-again-btn');
		if (playAgainBtn && gameData.tournamentId)
			playAgainBtn.hidden = true;
		else if (playAgainBtn)
			playAgainBtn.hidden = false;
		// Show the results overlay
		this.ui.showOnly('game-results', 'flex');
		// Add event listeners for the buttons (these need to be set each time)
		playAgainBtn?.addEventListener('click', () => {
			this.ui.showOnly('game-container')
			this.rematchGame(true);
		});
		document.getElementById('return-lobby-btn')?.addEventListener('click', () => {
			this.rematchGame(false);
			this.controllers.cleanup();
			this.controllers.destroy();
			// TODO: change SPA route 'test' for 'tournament' when ready
			SPA.getInstance().navigate(this.log.tournamentId ? 'test' : 'game-lobby');
			this.destroy()
		});
	}
	
	/**
	 * Reset the game to start a new one
	 */
	private rematchGame(state : boolean): void
	{
		if (this.connection.socket)
		{	this.connection.socket.send(JSON.stringify({
				type: 'RESTART_GAME',
				rematch: state
			}));
		}
    }

	public destroy()
	{
		this.controllers.cleanup();
		this.renderer.destroy();
		if (this.ai)
		{
			this.ai.stop();
			this.ai = null;
		}
	}
}
