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
import Tournament from '../tournament/Tournament.js';
import { formatTimeFromMilliseconds } from '../stats/handleStats.js';

export default class GameMatch extends Step
{
	private	game: Game;
	private	tournament: Tournament | null;
	public	controllers: GameControllers;
	private log: GameData;
	private renderer: GameRender;
	private config: GameConfig;
	private	ui: GameUI;
	private	connection: GameConnection;
	private	ai: GameAI | null = null;
	private	aiSide: 'player1' | 'player2' | null = null;
	private readyStateInterval: number | null = null;
	private countdownInterval: number | null = null;
	public	pauseInterval: number | null = null;
    // Prevent page scrolling with ArrowUp/ArrowDown while on game-match
    private preventScrollOnArrow = (e: KeyboardEvent) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            // Block the browser's default scroll but allow the event for game controllers
            e.preventDefault();
        }
    };

	constructor(game: Game, tournament?: Tournament | null)
	{
		super('game-container');
		this.game = game;
		this.tournament = tournament ?? null;
		this.renderer = game.getGameRender();
		this.config = game.getGameConfig();
		this.log = game.getGameLog();
		this.ui = game.getGameUI();
		this.connection = game.getGameConnection();
		if (this.log.mode === '1vAI')
		{	
			this.setAiSide(this.game.getGameLog());
			this.ai = new GameAI(this.game, this.aiSide);
		}
		this.controllers = new GameControllers(this.game, this.aiSide);
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

		this.updatePlayerActivity(true);

		// Disable main page scrolling using ArrowUp/ArrowDown while this step is active
		window.addEventListener('keydown', this.preventScrollOnArrow, { passive: false });
		
		const canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null;
		if (canvas)
		{
			this.renderer.canvas = canvas;
			this.renderer.ctx = canvas.getContext('2d');
			this.renderer.drawInitialState();
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
				console.warn("resume-btn-clicked");
				//pauseModal.style.display = 'none';
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
		/** search TournamentName  */
		/** to revert this change just delete everything but the code into the else */
		const players = { player1, player2 };
		if (this.tournament && this.tournament.getTournamentId() !== -42 && player1 && player2) {
		(document.getElementById('player1-name') as HTMLElement).innerHTML = this.showTournamentName(players, player1?.username) || "Waiting <br>player 1...";
		(document.getElementById('player2-name') as HTMLElement).innerHTML = this.showTournamentName(players, player2?.username) || "Waiting <br>player 2...";
		(document.getElementById('player1-avatar') as HTMLImageElement).src = player1?.avatarPath || "https://localhost:8443/back/images/7.png";
		(document.getElementById('player2-avatar') as HTMLImageElement).src = player2?.avatarPath || "https://localhost:8443/back/images/7.png";
		}else{
		(document.getElementById('player1-name') as HTMLElement).innerHTML = player1?.username || "Waiting <br>player 1...";
		(document.getElementById('player1-avatar') as HTMLImageElement).src = player1?.avatarPath || "https://localhost:8443/back/images/7.png";
		(document.getElementById('player2-name') as HTMLElement).innerHTML = player2?.username || "Waiting <br>player 2...";
		(document.getElementById('player2-avatar') as HTMLImageElement).src = player2?.avatarPath || "https://localhost:8443/back/images/7.png";
		}
		/*  end of search */
		if (readyBtn && waitingMsg)
		{
			readyBtn.onclick = () => {
				readyBtn.disabled = true;
				waitingMsg.innerHTML = `Waiting for<br>opponent confirmation...`;
				this.connection.socket?.send(JSON.stringify({ type: 'CLIENT_READY' }));
				if (this.ai)
					this.ai.start();
				this.controllers.setupControllers();
			};
		}

		if (this.log.mode === 'remote' && readyModal)
			this.startReadyStatePolling();
	}
	
	public showPauseModal(reason?: string, pauserId?: string, pauseStartTime?: number): void
	{
		const	confirmModal = document.getElementById('confirm-dialog-overlay');
		if(confirmModal && confirmModal.style.display != "none")
			return ;
		const pauseModal = document.getElementById('pause-modal');
		const pauseReason = document.getElementById('pause-reason');
		const resumeBtn = document.getElementById('resume-btn') as HTMLButtonElement | null;
		if (pauseModal)
			pauseModal.style.display = 'flex';
		if (pauseReason)
			pauseReason.textContent = reason || '';
		if (this.log.mode === 'remote' && resumeBtn && pauserId)
		{
			resumeBtn.style.display = (this.game.getOnlineId() === pauserId) ? 'inline-block' : 'none';
		}

		const timerEl = document.getElementById('pause-timer');
		const barEl = document.getElementById('pause-timer-bar') as HTMLDivElement | null;
		const duration = this.game.pauseDuration;
		if (!timerEl || !barEl || !duration)
			return ;

		if (this.pauseInterval)
		{
			clearInterval(this.pauseInterval);
			this.pauseInterval = null;
		}
		// If server provided pauseStartTime, adjust remaining to reflect elapsed time
		const elapsed = pauseStartTime ? Math.max(0, Date.now() - pauseStartTime) : 0;
		let	remaining = Math.max(0, duration - elapsed);
		const render = () => {
			if (remaining <= 0) {
				timerEl.textContent = '00:00';
				if (barEl) barEl.style.width = '0%';
				clearInterval(this.pauseInterval!);
				this.pauseInterval = null;
				return;
			}
			const secs = Math.ceil(remaining / 1000);
			const mm = String(Math.floor(secs / 60)).padStart(2, '0');
			const ss = String(secs % 60).padStart(2, '0');
			timerEl.textContent = `${mm}:${ss}`;
			if (barEl) {
				const pct = (remaining / duration) * 100;
				barEl.style.width = pct.toFixed(2) + '%';
			}
		};
		render();
		this.pauseInterval = window.setInterval(() => {
			remaining -= 500;
			render();
		}, 500);
	}

	public hidePauseModal(): void
	{
		const pauseModal = document.getElementById('pause-modal');
		if (pauseModal)
			pauseModal.style.display = 'none';
	}

	/**
	 * 
	 * @param players pair of players
	 * @param username username to find
	 * @returns tournamentUsername
	 */
	public showTournamentName(players: any, username: string): string
	{
		if (this.tournament && this.tournament.getTournamentId() !== -42)
		{
			const player = [players.player1, players.player2].find(
				(p: any) => p?.username === username
			);
			if (player && player.tournamentUsername) {
				return player.tournamentUsername;
			}
		}
		return "";
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
		// Search for tournamentName if on tournamentMatch
		if (this.tournament && this.tournament.getTournamentId() !== -42 && winnerElement && gameData.result?.winner)
		{
			const winnerUsername = gameData.result?.winner;
			const players = gameData.playerDetails;
			const tournamentName = this.showTournamentName(players, winnerUsername);
			if (tournamentName)
				winnerElement.textContent = tournamentName;
		}
		if (scoreElement)
		{
			const score = gameData.result?.score || [0, 0];
			scoreElement.textContent = `${score[0]} - ${score[1]}`;
		}
		if (durationElement)
		{
			durationElement.textContent = formatTimeFromMilliseconds(gameData.duration ?? 0);
		}
		const reasonElement = document.getElementById('end-reason');
		if (reasonElement)
			reasonElement.textContent = gameData.result?.endReason || 'Game ended';
		
		const	playAgainBtn = document.getElementById('play-again-btn');
		if (playAgainBtn && (gameData.tournamentId || gameData.mode === 'remote'))
			playAgainBtn.hidden = true;
		else if (playAgainBtn)
			playAgainBtn.hidden = false;

		const returnLobbyBtn = document.getElementById('return-lobby-btn');
		if (returnLobbyBtn)
		{
			if (gameData.tournamentId && gameData.tournamentId !== -42)
				returnLobbyBtn.textContent = "Return to Tournament";
			else
				returnLobbyBtn.textContent = "Return to Lobby";
		}
		// Show the results overlay
		this.ui.showOnly('game-results', 'flex');
		// Add event listeners for the buttons (these need to be set each time)
		playAgainBtn?.addEventListener('click', () => {
			this.ui.showOnly('hide-all')
			this.rematchGame(true);
		});
		document.getElementById('return-lobby-btn')?.addEventListener('click', () => {
			this.rematchGame(false);
			this.controllers.cleanup();
			this.controllers.destroy();
			this.destroy();
			const spa = SPA.getInstance();
			if(this.tournament && this.tournament.getTournamentId() !== -42)
			{
				console.log("FROM showGameResults, Handling match result for tournament:", this.tournament.getTournamentId());
				console.log("Match result data:", gameData);
				this.tournament.resumeTournament();
				this.tournament.handleMatchResult(gameData);
			}
			else
			{
				spa.currentGame = null;
				spa.navigate('game-lobby');
			}
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

	public updateReadyModal(playerDetails: any, readyStates: any) : void
	{
		const player1Name = document.getElementById('player1-name') as HTMLElement;
		const player1Avatar = document.getElementById('player1-avatar') as HTMLImageElement;
		const player2Name = document.getElementById('player2-name') as HTMLElement;
		const player2Avatar = document.getElementById('player2-avatar') as HTMLImageElement;
		const player1Ready = document.getElementById('player1-ready') as HTMLElement;
		const player2Ready = document.getElementById('player2-ready') as HTMLElement;

		player1Name.innerHTML = playerDetails.player1?.username || "Waiting <br>player 1...";
		player1Avatar.src = playerDetails.player1?.avatarPath || "https://localhost:8443/back/images/7.png";
		player2Name.innerHTML = playerDetails.player2?.username || "Waiting <br>player 2...";
		player2Avatar.src = playerDetails.player2?.avatarPath || "https://localhost:8443/back/images/7.png";

		player1Ready.textContent = readyStates.player1 ? "Ready" : "Press Ready...";
		if (player1Ready.textContent === "Ready")
			player1Ready.classList.remove("blink");
		player2Ready.textContent = readyStates.player2 ? "Ready" : "";
	}

	public showCountdown(seconds: number = 3, reason?: string) : void
	{
		const overlay = document.getElementById('countdown-overlay');
		const number = document.getElementById('countdown-number');
		const reasonElem = document.getElementById('countdown-reason');
		if (!overlay || !number)
			return ;

		if (this.countdownInterval)
		{
			clearInterval(this.countdownInterval);
			this.countdownInterval = null;
		}
	
		let count = seconds;
		overlay.style.display = 'flex';
		number.textContent = count.toString();
		if (reasonElem)
			reasonElem.textContent = reason || '';

		this.countdownInterval = window.setInterval(() => {
			count--;
			if (count > 0)
				number.textContent = count.toString();
			else if (count == 0)
			{
				number.textContent = "GO!";
				clearInterval(this.countdownInterval!);
				this.countdownInterval = null;
				setTimeout(() => {
					overlay.style.display = 'none';
				}, 400);
			}
		}, 1000);
	}

	public	updatePlayerActivity(state: boolean) : void
	{
		this.connection.socket?.send(JSON.stringify({
			type: 'GAME_ACTIVITY',
			active: state
		}));
	}

	public	setAiSide(gamelog : GameData) : void
	{
		const	player1Id : number | undefined = gamelog.playerDetails.player1?.id;
		if (player1Id !== undefined && player1Id <= -1 && player1Id >= -19)
			this.aiSide = 'player1';
		else
			this.aiSide = 'player2';
	}

	public	getAiSide() : 'player1' | 'player2' | null
	{
		return (this.aiSide);
	}

	// Ensure AI is running after reload/resume (safe due to guard in GameAI.start)
	public startAIIfNeeded(): void
	{
		// If we're in 1vAI but AI wasn't instantiated (e.g., cold reload), create it now
		if (!this.ai && this.game.getGameLog().mode === '1vAI') {
			// Determine AI side from current gamelog
			this.setAiSide(this.game.getGameLog());
			this.ai = new GameAI(this.game, this.aiSide);
			// Rebuild controllers so human/AI sides map correctly
			if (this.controllers) {
				this.controllers.destroy();
			}
			this.controllers = new GameControllers(this.game, this.aiSide);
			this.controllers.setupControllers();
		}
		if (this.ai)
			this.ai.start();
	}

	public destroy() : void
	{
		console.warn("GameMatch Destructor Called(!)");
		this.updatePlayerActivity(false);
		// Re-enable normal page behavior
		window.removeEventListener('keydown', this.preventScrollOnArrow);
		this.controllers.cleanup();
		this.renderer.destroy();
		if (this.ai)
		{
			this.ai.stop();
			this.ai = null;
		}
		// Not sure if needed or if can cause conflict - let's test it for a while...
		if (this.readyStateInterval)
		{
			clearInterval(this.readyStateInterval);
			this.readyStateInterval = null;
		}
		if (this.countdownInterval)
		{
			clearInterval(this.countdownInterval);
			this.countdownInterval = null;
		}
	}
}
