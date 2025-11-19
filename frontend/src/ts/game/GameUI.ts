/**
 * GameUI.ts -> UI setup and event listeners
 */

import Game from './Game.js'
import { GameData } from './types.js'

export class GameUI
{
	private	game: Game;

	constructor(game: Game)
	{
		this.game = game;
	}

	showOnly(divId: string, displayStyle: string = "block") : void
	{
		const divIndex = [
			'initial-screen',
			'config-panel',
			'game-results',
			'player2-login-panel',
			'ready-modal',
			'countdown-overlay',
			'pause-modal'
		];
		if (divId === "hide_all")
		{
			divIndex.forEach(id => {
			const	checkDiv = document.getElementById(id);
			if (checkDiv)
				checkDiv.style.display = "none";
		});
			return ;
		}
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
		this.setupEventListeners();
		this.requestGamesList();
	}

	// Sets up event listeners for game mode buttons, which after will also set controllers
	public setupEventListeners()
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
			this.game.setGuestInfo('player2', 'ai');
			this.game.setGameMode('1vAI');
			this.showOnly('config-panel');
		});
		document.getElementById('play-online')?.addEventListener('click', async () => {
			await this.game.setPlayerInfo('player1', null);	
			this.game.setGameMode('remote');
			this.showOnly('config-panel');
		});
		
		// Configuration panel elements
		this.setupConfigPanelListeners();
		
		// Start game button
		document.getElementById('start-game')?.addEventListener('click', () => {
			this.launchGame();
		});
		// Back button - returns to lobby
		document.getElementById('back-button')?.addEventListener('click', () => {
			this.showOnly('initial-screen', 'flex');
		});
		// Back button on 2nd player selection panel
		document.getElementById('player2-back-btn')?.addEventListener('click', () => {
			this.showOnly('initial-screen', 'flex');
		});
		// Refresh lobby button
		document.getElementById('refresh-lobby-btn')?.addEventListener('click', () => {
			this.requestGamesList();
		});
	}
	
	public	requestGamesList()
	{
		const connection = this.game.getGameConnection();
		if (connection.socket && connection.connectionStat)
			connection.socket.send(JSON.stringify({ type: 'SHOW_GAMES' }));
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
				if (Number(value) < 4) 
				{
					scoreValue.classList.remove('text-supernova-400', 'text-international-orange-400', 'text-international-orange-600');
					scoreValue.classList.add('text-supernova-400');
				}	
				else if (Number(value) > 4 && Number(value) < 8)
				{
					scoreValue.classList.remove('text-supernova-400', 'text-international-orange-400', 'text-international-orange-600');
					scoreValue.classList.add('text-international-orange-400');
				}
				else
				{	
					scoreValue.classList.remove('text-supernova-400', 'text-international-orange-400', 'text-international-orange-600');
					scoreValue.classList.add('text-international-orange-600');
				}
				scoreValue.textContent = value;
				this.game.getGameConfig().scoreLimit = parseInt(value);
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
				difficultyValue.classList.remove('text-supernova-400', 'text-international-orange-400', 'text-international-orange-600');
				difficultyValue.classList.add('text-international-orange-400');
				let difficultyLevel: 'easy' | 'medium' | 'hard' = 'medium';
				if (value === 1)
				{
					difficultyText = 'Easy';
					difficultyLevel = 'easy';
					difficultyValue.classList.remove('text-supernova-400', 'text-international-orange-600', 'text-international-orange-400');
					difficultyValue.classList.add('text-supernova-400');
				}
				else if (value === 3)
				{
					difficultyText = 'Hard';
					difficultyLevel = 'hard';
					difficultyValue.classList.remove('text-supernova-400', 'text-international-orange-600', 'text-international-orange-400');
					difficultyValue.classList.add('text-international-orange-600');
				}
				difficultyValue.textContent = difficultyText;
				this.game.getGameConfig().difficulty = difficultyLevel;
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
			const success = await this.game.getGameConnection().checkPlayer({ email, password });
			
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
			this.game.setGuestInfo('player2', 'guest');
			this.showOnly('config-panel');
			if (errorMsg)
				errorMsg.textContent = '';
		};
	}

	public launchGame(): void 
	{
		if (!this.game.getGameConnection().socket || !this.game.getGameConnection().connectionStat)
		{
			console.error("Cannot join game: connection not ready");
			return ;
		}
		this.game.setGameConfig(this.game.getGameConfig());
		this.game.getGameConnection().joinGame();
	}

	public	updateLobby(games: GameData[]): void
	{
		const lobbyDiv = document.getElementById('lobby-games-list');
		if (!lobbyDiv)
			return;
		lobbyDiv.innerHTML = '';
		if (!games || games.length === 0)
		{
			lobbyDiv.innerHTML = '<div class="text-white text-center">No games available.</div>';
			return ;
		}
		// Per each game returned by backend, we create a new game card and append it to lobbyDiv
		// TODO: we can add more elements to the card as "Ready, Full, In progress"...
		console.log("GameDATA from server games", games);
		games.forEach((game: GameData) => {
			const card = document.createElement('div');
			card.className = 'bg-pong-primary rounded p-4 flex flex-col gap-2 border-1 border-pong-tertiary shadow-md';
			const DifficultyColor = game.config?.difficulty === 'easy' ? 'text-supernova-400' : game.config?.difficulty === 'medium' ? 'text-international-orange-400' : 'text-international-orange-600';
			const scoreColor = (game.config?.scoreLimit && game.config.scoreLimit < 4) ? 'text-supernova-400' : (game.config?.scoreLimit && game.config.scoreLimit < 8) ? 'text-international-orange-400' : 'text-international-orange-600';
			card.innerHTML = `
				<div class="text-white font-medium">Game ID: <span class="font-bold">${game.id}</span></div>
				<hr class="border-candlelight-400"/>
				<div class="text-pong-text-secondary">Host: <span class="text-international-orange-400">${game.playerDetails.player1?.username}</span></div>
				<div class="text-pong-text-secondary">Limit score: <span class="${scoreColor}">${game.config?.scoreLimit}</span></div>
				<div class="text-pong-text-secondary">Difficulty: <span class="${DifficultyColor}">${game.config?.difficulty}</span></div>
				<button class="join-game-btn btn-pong-secondary rounded px-3 py-2 mt-2" data-gameid="${game.id}">Join</button>
			`;
			lobbyDiv.appendChild(card);
		});
		// Join game button - copy the game.lod metadata and uses to call JOIN API endpoint (should work)
		// TODO: protect errors like game full or maybe only allow click event when 100% sure is the right moment
		lobbyDiv.querySelectorAll('.join-game-btn').forEach(btn => {
			btn.addEventListener('click', (e) => {
				const gameId = (e.target as HTMLElement).getAttribute('data-gameid');
				if (gameId)
				{	
					this.game.setGameIsHost(false);
					this.game.getGameConnection().parseUserInfo(null);
					this.game.getGameConnection().joinGame(gameId);
				}
			});
		});
	}
}
