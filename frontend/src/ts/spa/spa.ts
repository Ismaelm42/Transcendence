import { Step } from "./stepRender.js";
import { showMessage, showConfirmDialog } from "../modal/showMessage.js";
import Game from "../game/Game.js"
import { initOnlineSocket, onlineSocket } from "../friends/onlineUsersSocket.js";
import Tournament from "../tournament/Tournament.js";
import { clearSearchFilter } from "../chat/filterSearch.js";

export class SPA {
    private container: HTMLElement;
    private static instance: SPA; // Guardamos una referencia estática y privada para solo poder acceder con el getter
	public currentGame: Game | null = null;
	public currentTournament: Tournament | null = null;
	private currentStep: string | null = null;
	// Guard flag to avoid double prompts (popstate + hashchange firing together)
	private navigationGuardActive: boolean = false;

    private routes: { [key: string]: { module: string; protected: boolean } } = {
        'home': { module: '../home/homeRender.js', protected: false },
        'login': { module: '../login/loginRender.js', protected: false },
        'register': { module: '../login/registerRender.js', protected: false },
        'game-lobby': { module: '../game/Game.js', protected: true },
        'game-match': { module: '../game/GameMatch.js', protected: true },
		'play-chess': {module: '../chess/chessRender.js', protected: true },
        'tournament-lobby': { module: '../tournament/Tournament.js', protected: true },
        'friends': { module: '../friends/friendsRender.js', protected: true },
        'chat': { module: '../chat/chatRender.js', protected: true },
        'stats': { module: '../stats/statsRender.js', protected: true },
        'logout': { module: '../login/logoutRender.js', protected: true },
		'profile': { module: '../profile/userProfileRender.js', protected: true }
    };

    public constructor(containerId: string) {
        this.container = document.getElementById(containerId) as HTMLElement;
		SPA.instance = this;
        this.loadHEaderAndFooter();	
		this.loadStep();

		// Unified hash-based routing (single source of truth)
		let revertingHash = false; // guard re-entrancy when we revert after a cancelled leave
		window.addEventListener('hashchange', async () => {
			if (revertingHash) return; // ignore synthetic change caused by our own revert
			const nextStep = location.hash.replace('#', '') || 'home';
			// Guard: leaving an active game-match
			if (!this.navigationGuardActive && this.currentStep === 'game-match' && nextStep !== 'game-match') {
				this.navigationGuardActive = true;
				const confirmed = await this.confirmLeaveGameMatch(nextStep);
				this.navigationGuardActive = false;
				if (!confirmed) {
					this.currentGame?.getGameConnection().socket?.send(JSON.stringify({ type: 'RESUME_GAME' }));
					revertingHash = true;
					window.location.hash = `#${this.currentStep}`; // restore previous
					revertingHash = false;
					return;
				}
			}
			// Tournament in progress warning logic (moved from popstate)
			if (this.currentTournament && typeof this.currentTournament.getTournamentId === 'function') {
				const tournamentId = this.currentTournament.getTournamentId();
				const warningFlag = this.currentTournament.LeaveWithoutWarningFLAG;
				if (this.currentStep === 'tournament-lobby' && nextStep !== 'tournament-lobby' && typeof tournamentId !== 'undefined' && tournamentId !== null && tournamentId > -42 && warningFlag !== true) {
					showMessage("Tournament in progress aborted", 5000);
					const tournamentUI = this.currentTournament.getTournamentUI?.();
					if (tournamentUI && typeof tournamentUI.resetTournament === 'function') {
						tournamentUI.resetTournament();
					}
					const messageContainer = document.getElementById("message-container");
					const intervalId = setInterval(() => {
						if (messageContainer?.style.display === 'none') {
							clearInterval(intervalId);
						}
					}, 1000);
				}
			}
			this.loadStep();
		});

			// Native browser reload / close guard
			window.onbeforeunload = (e) => {
				if (this.currentStep === 'game-match' && this.currentGame?.isGameActive?.()) {
					e.preventDefault();
					e.returnValue = '';
					return '';
				}
			};
		
		window.addEventListener("pageshow", (event) => {
			if (event.persisted && location.hash === '#login') {
				console.log("Recargando el step de login" );
				const appContainer = document.getElementById('app-container');
				if (appContainer) {
					appContainer.innerHTML = '';
				}
				this.loadStep();
			}
		});
    }

    private async loadHEaderAndFooter() {

        try {
			// cargar el header

			const headerResponse = await fetch('../../html/layout/header.html');
			if (headerResponse.ok) {
				const headerContent = await headerResponse.text();
				const headerElement = document.getElementById('header-container');
				if (headerElement) {
					headerElement.innerHTML = headerContent;
				}
			} else {
				console.error('Error al cargar el header:', headerResponse.statusText);
			}
			// Cargar el footer
            const footerResponse = await fetch('../../html/layout/footer.html');
            if (footerResponse.ok) {
                const footerContent = await footerResponse.text();
                const footerElement = document.getElementById('footer-container');
                if (footerElement) {
                    footerElement.innerHTML = footerContent;
                }
				console.log ('footer cargado');
            } else {
                console.error('Error al cargar el footer:', footerResponse.statusText);
            }
        } catch (error) {
            console.error('Error al cargar el footer:', error);
        }
    }

    async navigate(step: string) {
		// Intercept programmatic navigation (guarding game-match before changing hash)
		if (this.currentStep === 'game-match' && step !== 'game-match') {
			const confirmed = await this.confirmLeaveGameMatch(step);
			if (!confirmed) {
				this.currentGame?.getGameConnection().socket?.send(JSON.stringify({ type: 'RESUME_GAME' }));
				return;
			}
		}
		if (location.hash === `#${step}`) return; // no-op if already there
		location.hash = `#${step}`; // hashchange handler will call loadStep
    }

	async loadStep() {
		let step = location.hash.replace('#', '') || 'home';
		// this.navigate(step);

		// // Obtener la URL actual
		// let currentUrl = window.location.href;

		// // Eliminar todo lo que está después de la última barra
		// let baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/') + 1);

		// // Modificar la URL para que termine con /#home
		// let newUrl = baseUrl + '#home';

		// // Actualizar la URL sin recargar la página
		// history.replaceState(null, '', newUrl);

		// DEBUG: show why the "leaving game-match" branch may not run
        try {
            console.debug('SPA.leave-check', {
                currentStep: this.currentStep,
                nextStep: step,
                hasCurrentGame: !!this.currentGame,
                getGameConnectionResult: this.currentGame?.getGameConnection?.(),
                hasSocket: !!this.currentGame?.getGameConnection?.()?.socket,
                isGameActive: this.currentGame?.isGameActive?.(),
                currentTournament: this.currentTournament
            });
        } catch (e) {
            console.debug('SPA.leave-check error', e);
        }
		console.log("this.currentStep: " , this.currentStep);
		console.log("step: " , step);
		// Handle leaving game-match step on active game
		if (this.currentStep === 'game-match')
			await this.gameMatchNavigation(this.currentStep, step);
		
        this.currentStep = step;
		
		const routeConfig = this.routes[step];
		if (routeConfig) {
			const module = await import(`./${routeConfig.module}`);
			let stepInstance;
			if (step === 'game-match')
			{	
				stepInstance = new module.default(this.currentGame, this.currentTournament);
				if (this.currentGame && stepInstance)
					this.currentGame.setGameMatch(stepInstance);
			}
			else if (step === 'game-lobby')
			{
				stepInstance = new module.default('app-container');
				this.currentGame = stepInstance;
			}
			else if (step === 'tournament-lobby')
			{
				stepInstance = new module.default('app-container');
				this.currentTournament = stepInstance;
				console.log('tournament-lobby currentTournament: ', this.currentTournament);
			}
			else
				stepInstance = new module.default('app-container');
			const user = await stepInstance.checkAuth();
			if (user) {
				console.log("Usuario autenticado: ", user);
				// Si el usuario está autenticado, inicializamos el socket de usuarios online
				if (!onlineSocket || onlineSocket.readyState === WebSocket.CLOSED) {
					initOnlineSocket();
				}
			} else {
				console.log("Usuario no autenticado: ", user);
			}
			if (routeConfig.protected && !user) {
				console.warn(`Acceso denegado a la ruta protegida: ${step}`);
				this.navigate('login');
				return;
			}
			//await stepInstance.init();
			if (step === 'chat') {
				try { clearSearchFilter(); } catch (e) { /* ignore */ }
			}
			await stepInstance.init();
		} else {
			showMessage('url does not exist', 2000);
			window.location.hash = '#home'; 
		}
	}
	public static getInstance(): SPA {
		return SPA.instance;
	}

	public async	gameMatchNavigation(currentStep: string, nextStep: string)
	{
		if (!this.currentGame)
			return ;
	
		const routeConfig = this.routes[nextStep];
		// Navigating OUT OF game-match
		if (currentStep === 'game-match' && nextStep != 'game-match')
		{		
			const	log = this.currentGame.getGameLog();
			const	match = this.currentGame.getGameMatch();
			// Remote mode - pause and keep the game alive for a set time
			if (log.mode === 'remote' && this.currentGame.getGameConnection() &&
				this.currentGame.getGameConnection().socket && this.currentGame.isGameActive())
			{
				const username = this.currentGame.getGameIsHost()
					? log.playerDetails.player1?.username
					: log.playerDetails.player2?.username;
				this.currentGame.getGameConnection()?.socket?.send(
					JSON.stringify({
						type: 'PAUSE_GAME',
						reason: `${username} left the game`
					})
				);
			}
			// Any other game-mode, kill game on the backend and do not save log on database
			else if (log.mode != 'remote' && this.currentGame.getGameConnection() &&
				this.currentGame.getGameConnection().socket && this.currentGame.isGameActive())
			{
				this.currentGame.getGameConnection().killGameSession(this.currentGame.getGameLog().id);
			}
			// If instance of match on browser, clean-remove (to prevent duplicated listeners on resume)
			if (match)
			{
				match.updatePlayerActivity(false);
				match.destroy();
			}
		}
	
		// RELOADING game-match - this is going to be resume online, reload will be much simpler
		else if (currentStep === 'game-match' && nextStep === 'game-match')
		{
			if (this.currentGame.getGameMatch())
				this.currentGame.getGameMatch()?.destroy();
			try
			{
				const {sessions, userId} = await this.currentGame.getGameConnection().checkActiveGameSessions();
				const userGame = sessions.find(
					(session: any) =>
						session.playerDetails.player1?.id === userId ||
						session.playerDetails.player2?.id === userId
				);
				if (!userGame)
				{
					showMessage('No active game session found. Redirecting to home...', 2000);
					this.navigate('home');
					return ;
				}
				// else: resume game as needed
				else
				{
					const module = await import(`./${routeConfig.module}`);
					const stepInstance = new module.default(this.currentGame, this.currentTournament);
					if (this.currentGame && stepInstance)
						this.currentGame.setGameMatch(stepInstance);
				}
			} catch (e){
				showMessage('Error checking game session. Redirecting to home...', 2000);
				this.navigate('home');
			}
		}
	}

	// Centralized confirmation logic for leaving game-match
	private async confirmLeaveGameMatch(nextStep: string): Promise<boolean>
	{
		// If there's no active game object or game not active, allow silently
		if (!this.currentGame || !this.currentGame.isGameActive?.())
			return true;
		this.currentGame.getGameConnection()?.socket?.send(JSON.stringify({
			type: 'PAUSE_GAME',
			reason: 'User navigating away'
		}));
		let	msg = this.currentGame.getGameLog().tournamentId ? " and tournament" : "";
		const	left = await showConfirmDialog("You are about to leave the game. This will end your current session" + msg + ". Continue?", this.currentGame.pauseDuration);
		if (left && this.currentGame.getGameLog().mode != 'remote')
			this.currentGame.getGameConnection()?.killGameSession(this.currentGame.getGameLog().id);
		return left;
	}
}

document.addEventListener('DOMContentLoaded', () => new SPA('content'));
