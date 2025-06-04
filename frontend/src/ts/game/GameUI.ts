/**
 * GameUI.ts -> UI setup and event listeners
 */

import { GameControllers } from './GameControllers.js';
import { GameData } from './types.js';

export class GameUI
{
	private	game: any;
	public	controllers: GameControllers;

	constructor(game: any)
	{
		this.game = game;
		this.controllers = new GameControllers(game);
	}

	showOnly(divId: string, displayStyle: string = "block") : void
	{
		const divIndex = [
			'select-game',
			'config-panel',
			'game-container',
			'game-results',
			'player2-login-panel'
		];
		divIndex.forEach(id => {
			const	checkDiv = document.getElementById(id);
			if (checkDiv)
				checkDiv.style.display = (id === divId) ? displayStyle : "none";
		});
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
		document.getElementById('play-1v1')?.addEventListener('click', async () => {
			await this.game.setPlayerInfo('player1', null);
			this.game.setGameMode('1v1');
			this.showOnly('player2-login-panel');
			this.setupPlayer2LoginPanel();
		});
		
		document.getElementById('play-ai')?.addEventListener('click', async () => {
			await this.game.setPlayerInfo('player1', null);
			this.game.setGameMode('1vAI');
			this.showOnly('config-panel');
		});
	
		document.getElementById('play-online')?.addEventListener('click', async () => {
			// Lobby + diff player entry assignation
			// await this.game.setPlayerInfo('player1', null);
			this.game.setGameMode('remote');
			this.showOnly('config-panel');
		});
		
		// Configuration panel elements
		this.setupConfigPanelListeners();
		
		// Start game button
		document.getElementById('start-game')?.addEventListener('click', () => {
			this.launchGame(this.game.log.mode);
		});
	
		// Back button - returns to lobby
		document.getElementById('back-button')?.addEventListener('click', () => {
			this.showOnly('select-game');
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
	
	private setupPlayer2LoginPanel(): void
	{
		const	loginPanel = document.getElementById('player2-login-panel');
		const	configPanel = document.getElementById('config-panel');
		const	loginForm = document.getElementById('player2-login-form') as HTMLFormElement;
		const	guestBtn = document.getElementById('player2-guest-btn');
		const	errorMsg = document.getElementById('player2-login-error');

		if (!loginPanel || !loginForm || !guestBtn || !configPanel)
			return;

		// Handle registered user login
		loginForm.onsubmit = async (e) => {
			e.preventDefault();
			const email = (document.getElementById('player2-email') as HTMLInputElement).value;
			const password = (document.getElementById('player2-password') as HTMLInputElement).value;
			const success = await this.game.connection.checkPlayer({ email, password });
			
			if (!email || !password)
			{
				if (errorMsg)
					errorMsg.textContent = 'Please enter both email and password';
				return;
			}

			if (success)
			{
				this.game.setPlayerInfo('player2', { email, password });
				this.showOnly('config-panel');
				if (errorMsg) errorMsg.textContent = '';
			}
			else
				if (errorMsg) errorMsg.textContent = 'Invalid email or password. Please try again';
		};

		// Handle guest
		guestBtn.onclick = () => {
			const guestUser = {
				id: `guest-${Date.now()}`,
				username: 'Guest',
				tournamentUsername: 'Guest',
				email: 'guest@example.com',
				avatarPath: '/images/default-avatar.png'
			};
			this.game.setTempPlayerInfo('player2', guestUser);
			this.showOnly('config-panel');
			if (errorMsg)
				errorMsg.textContent = '';
		};
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
	
		this.showOnly('game-container');
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
		this.showOnly('game-results', 'flex');
		// Add event listeners for the buttons (these need to be set each time)
		document.getElementById('play-again-btn')?.addEventListener('click', () => {
			this.showOnly('game-container')
			this.rematchGame();
		});
		
		document.getElementById('return-lobby-btn')?.addEventListener('click', () => {
			this.showOnly('select-game');
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
