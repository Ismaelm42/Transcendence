/**
 * GameUI.ts -> UI setup and event listeners
 */

import { GameControllers } from './GameControllers.js';
import { GameData } from './types.js';

export class GameUI
{
	private	game: any;
	public	controllers: GameControllers;
	private selectedGameMode: string = '';

	constructor(game: any)
	{
		this.game = game;
		this.controllers = new GameControllers(game);
	}

	showOnly(divId: string) : void
	{
		const divIndex = [
			'select-game',
			'config-panel',
			'game-canvas',
			'game-results-overlay'
		];
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
			this.selectedGameMode = '1vAI';
			this.showConfigPanel('AI Game');
			this.controllers.setupControllers('1vAI');
		});
	
		document.getElementById('play-1v1')?.addEventListener('click', () => {
			this.selectedGameMode = '1v1';
			this.showConfigPanel('Local 1v1');
			this.controllers.setupControllers('1v1');
		});
		
		document.getElementById('play-online')?.addEventListener('click', () => {
			this.selectedGameMode = 'remote';
			this.showConfigPanel('Online Game');
			this.controllers.setupControllers('remote');
		});
		
		document.getElementById('play-tournament')?.addEventListener('click', () => {
			this.selectedGameMode = 'tournament';
			this.showConfigPanel('Tournament Game');
			this.controllers.setupControllers('tournament');
		});
		
		// Configuration panel elements
		this.setupConfigPanelListeners();
		
		// Start game button
		document.getElementById('start-game')?.addEventListener('click', () => {
			this.launchGame(this.selectedGameMode);
		});
	
		// Back button - returns to lobby
		document.getElementById('back-button')?.addEventListener('click', () => {
			window.location.reload();
		});
	}
	
	/**
	 * Set up listeners for the configuration panel elements
	 */
	private setupConfigPanelListeners(): void
	{
		// Score limit slider
		const scoreSlider = document.getElementById('score-limit') as HTMLInputElement;
		const scoreValue = document.getElementById('score-value');
		if (scoreSlider && scoreValue)
		{
			scoreSlider.addEventListener('input', () => {
				const value = scoreSlider.value;
				scoreValue.textContent = value;
				this.game.gameConfig.scoreLimit = parseInt(value);
			});
		}
		
		// Difficulty slider
		const difficultySlider = document.getElementById('difficulty') as HTMLInputElement;
		const difficultyValue = document.getElementById('difficulty-value');
		if (difficultySlider && difficultyValue)
		{
			difficultySlider.addEventListener('input', () => {
				const value = parseInt(difficultySlider.value);
				let difficultyText = 'Medium';
				let difficultyLevel: 'easy' | 'medium' | 'hard' = 'medium';
				if (value === 1)
				{
					difficultyText = 'Easy';
					difficultyLevel = 'easy';
				}
				else if (value === 3)
				{
					difficultyText = 'Hard';
					difficultyLevel = 'hard';
				}
				difficultyValue.textContent = difficultyText;
				this.game.gameConfig.difficulty = difficultyLevel;
			});
		}
	}
	
	/**
	 * Set up and show the game configuration panel
	 * @param modeTitle The title to display in the configuration panel
	 */
	private showConfigPanel(modeTitle: string): void
	{
		const configPanel = document.getElementById('config-panel');
		const configTitle = document.getElementById('config-title');
		const selectGameDiv = document.getElementById('select-game');
		if (selectGameDiv)
			selectGameDiv.style.display = 'none';
		if (configTitle)
			configTitle.textContent = `Select configuration for ${modeTitle}`;
		if (configPanel)
			configPanel.style.display = 'block';
	}

	launchGame(mode: string, tournamentId?: number): void 
	{
		if (!this.game.connection.socket || !this.game.connection.connectionStat)
		{
			console.error("Cannot join game: connection not ready");
			return ;
		}
		this.game.setGameConfig(this.game.gameConfig);
		this.controllers.setupControllers(mode);
		this.game.connection.joinGame(mode, tournamentId);
	
		const	selectGame = document.getElementById('select-game');
		if (selectGame)
			selectGame.style.display = "none";
		const	gameDiv = document.getElementById('game-container');
		if (gameDiv)
			gameDiv.style.display = "block";
		const	configPanel = document.getElementById('config-panel');
		if (configPanel)
			configPanel.style.display = "none";
	
		this.game.renderer.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
		if (this.game.renderer.canvas)
			this.game.renderer.ctx = this.game.renderer.canvas.getContext('2d');
	}
	
	/**
	 * Display game results when a game ends
	 * @param gameData Complete game data
	 */
	public showGameResults(gameData: GameData): void
	{
		console.log("Showing game results:", gameData);
		
		// Get the game results overlay element
		const resultsContainer = document.getElementById('game-results');
		if (!resultsContainer)
		{
			console.error("Game results container not found!");
			return;
		}
		
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
		resultsContainer.style.display = "flex";
		// Add event listeners for the buttons (these need to be set each time)
		document.getElementById('play-again-btn')?.addEventListener('click', () => {
			if (resultsContainer)
				resultsContainer.style.display = "none";
			this.rematchGame();
		});
		
		document.getElementById('return-lobby-btn')?.addEventListener('click', () => {
			if (resultsContainer)
				resultsContainer.style.display = "none";
			window.location.reload();
		});
	}
	
	/**
	 * Reset the game to start a new one
	 */
	private rematchGame(): void
	{
		this.game.log.startTime = 0;
		this.game.log.duration = 0;
		this.game.log.result = { winner: '', loser: '', score: [0, 0] };
		this.game.renderer.isGameActive = true;
		this.launchGame(this.game.log.mode, this.game.log.tournamentId);
    }
}
