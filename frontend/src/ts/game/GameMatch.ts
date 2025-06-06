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

export default class GameMatch extends Step
{
	private game: Game;
	public	controllers: GameControllers;
	private log: GameData;
	private renderer: GameRender;
	private config: GameConfig;
	private	ui: GameUI;
	private	connection: GameConnection;

	constructor(game: Game)
	{
		super('game-container');
		this.game = game;
		this.renderer = game.getGameRender();
		this.controllers = new GameControllers(game);
		this.config = game.getGameConfig();
		this.log = game.getGameLog();
		this.ui = game.getGameUI();
		this.connection = game.getGameConnection();
	}

	async initHTML(appElement: HTMLElement): Promise<void>
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
		this.controllers.cleanup();
		this.controllers.setupControllers(this.log.mode);
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
		
		// Show the results overlay
		this.ui.showOnly('game-results', 'flex');
		// Add event listeners for the buttons (these need to be set each time)
		document.getElementById('play-again-btn')?.addEventListener('click', () => {
			this.ui.showOnly('game-container')
			this.rematchGame();
		});
		
		document.getElementById('return-lobby-btn')?.addEventListener('click', () => {
			SPA.getInstance().navigate('game-lobby');
		});
	}
	
	/**
	 * Reset the game to start a new one
	 */
	private rematchGame(): void
	{
		let rematchLog : GameData;
		rematchLog = this.game.getGameLog();
		rematchLog.startTime = 0;
		rematchLog.duration = 0;
		rematchLog.result = { winner: '', loser: '', score: [0, 0] };
		this.game.setGameLog(rematchLog);
		this.ui.launchGame();
    }

	public destroy()
	{
		this.controllers.cleanup();
		this.renderer.destroy();
	}
}
