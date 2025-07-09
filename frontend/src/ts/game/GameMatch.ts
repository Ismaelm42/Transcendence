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
	private readyStateInterval: number | null = null;

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
		}
		this.showReadyModal();
		const	pauseModal = document.getElementById('pause-modal');
		const	pauseBtn = document.getElementById('pause-btn');
		if (pauseModal && pauseBtn)
		{
			pauseBtn.onclick = () => {
				if (this.log.mode === 'remote')
				{
					this.connection.socket?.send(JSON.stringify({
						type: 'PAUSE_GAME',
					}));
				}
				else
				{
					this.connection.socket?.send(JSON.stringify({
						type: 'PAUSE_GAME',
						reason: "A player has paused the game"
					}));
				}
			};
		}
		const	resumeBtn = document.getElementById('resume-btn');
		if (pauseModal && resumeBtn)
		{
			resumeBtn.onclick = () => {
				this.connection.socket?.send(JSON.stringify({ type: 'RESUME_GAME' }));
			};
		}
	}
	
	/**
	 * Display player waiting/ready status modal when game created
	 */
	public	showReadyModal() : void
	{
		const readyModal = document.getElementById('ready-modal');
		const readyBtn = document.getElementById('ready-btn') as HTMLButtonElement;
		const waitingMsg = document.getElementById('waiting-msg');
		const player1 = this.log.playerDetails.player1;
		const player2 = this.log.playerDetails.player2;
		(document.getElementById('player1-name') as HTMLElement).textContent = player1?.username || "Waiting player 1...";
		(document.getElementById('player1-avatar') as HTMLImageElement).src = player1?.avatarPath || "https://localhost:8443/back/images/7.png";
		(document.getElementById('player2-name') as HTMLElement).textContent = player2?.username || "Waiting player 2...";
		(document.getElementById('player2-avatar') as HTMLImageElement).src = player2?.avatarPath || "https://localhost:8443/back/images/7.png";

		if (readyBtn && waitingMsg)
		{
			readyBtn.onclick = () => {
				readyBtn.disabled = true;
				waitingMsg.textContent = "Waiting for opponent confirmation...";
				this.connection.socket?.send(JSON.stringify({ type: 'CLIENT_READY' }));
				if (this.ai)
					this.ai.start();
				this.controllers.setupControllers();
			};
		}

		if (this.log.mode === 'remote' && readyModal)
			this.startReadyStatePolling();
	}

	public showPauseModal(reason?: string, pauserId?: string): void
	{
		console.warn("pauserID", pauserId);
		const pauseModal = document.getElementById('pause-modal');
		const pauseReason = document.getElementById('pause-reason');
		const resumeBtn = document.getElementById('resume-btn') as HTMLButtonElement | null;
		if (pauseModal)
			pauseModal.style.display = 'flex';
		if (pauseReason)
			pauseReason.textContent = reason || '';
		if (this.log.mode === 'remote' && resumeBtn && pauserId)
		{
			console.warn("onlineid = ", this.game.getOnlineId());
			console.warn("pauserId = ", pauserId);
			resumeBtn.style.display = (this.game.getOnlineId() === pauserId) ? 'inline-block' : 'none';
		}
	}

	public hidePauseModal(): void
	{
		const pauseModal = document.getElementById('pause-modal');
		if (pauseModal)
			pauseModal.style.display = 'none';
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
		if (playAgainBtn && (gameData.tournamentId || gameData.mode === 'remote'))
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
			this.destroy();
			const spa = SPA.getInstance();
			spa.currentGame = null;
			spa.navigate(this.log.tournamentId ? 'test' : 'game-lobby');
			// TODO: change SPA route 'test' for 'tournament' when ready
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

	public startReadyStatePolling()
	{
		if (this.readyStateInterval)
			return ;
		this.readyStateInterval = window.setInterval(() => {
			this.connection.socket?.send(JSON.stringify({ type: 'GET_READY_STATE' }));
		}, 1000);
	}

	public stopReadyStatePolling()
	{
		if (this.readyStateInterval)
		{
			clearInterval(this.readyStateInterval);
			this.readyStateInterval = null;
		}
	}

	public updateReadyModal(playerDetails: any, readyStates: any)
	{
		const player1Name = document.getElementById('player1-name') as HTMLElement;
		const player1Avatar = document.getElementById('player1-avatar') as HTMLImageElement;
		const player2Name = document.getElementById('player2-name') as HTMLElement;
		const player2Avatar = document.getElementById('player2-avatar') as HTMLImageElement;
		const player1Ready = document.getElementById('player1-ready') as HTMLElement;
		const player2Ready = document.getElementById('player2-ready') as HTMLElement;

		player1Name.textContent = playerDetails.player1?.username || "Waiting player 1...";
		player1Avatar.src = playerDetails.player1?.avatarPath || "https://localhost:8443/back/images/7.png";
		player2Name.textContent = playerDetails.player2?.username || "Waiting player 2...";
		player2Avatar.src = playerDetails.player2?.avatarPath || "https://localhost:8443/back/images/7.png";

		player1Ready.textContent = readyStates.player1 ? "Ready" : "";
		player2Ready.textContent = readyStates.player2 ? "Ready" : "";
	}

	public showCountdown(seconds: number = 3)
	{
		const overlay = document.getElementById('countdown-overlay');
		const number = document.getElementById('countdown-number');
		if (!overlay || !number)
			return ;
		overlay.style.display = 'flex';
		let count = seconds;
		number.textContent = count.toString();
		const interval = setInterval(() => {
			count--;
			if (count > 0)
				number.textContent = count.toString();
			else
			{
				number.textContent = "GO!";
				setTimeout(() => {
					overlay.style.display = 'none';
				}, 800);
				clearInterval(interval);
			}
		}, 1000);
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
