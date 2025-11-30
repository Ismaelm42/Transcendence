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
		'play-chess': { module: '../chess/chessRender.js', protected: true },
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

		// Handle Reloads: Check if we were in an active session before the reload
		const wasActiveSession = sessionStorage.getItem('was_active_session');
		sessionStorage.removeItem('was_active_session'); // Clear flag immediately

		const initialHash = location.hash.replace('#', '');

		// Redirect if we flagged an active session OR if trying to load game-match directly (which is never valid on reload)
		if (wasActiveSession === 'true' || initialHash === 'game-match') {
			location.hash = '#home';
			setTimeout(() => showMessage("You reloaded the page during active game session\nSession has been terminated", 6000), 500);
		} else {
			this.loadStep();
		}

		window.addEventListener('beforeunload', (e: BeforeUnloadEvent) => {
			const tId = this.currentTournament?.getTournamentId();
			const instId = (this.currentTournament as any)?.instanceId;
			console.warn(`[beforeunload] Step: ${this.currentStep}, TournamentID: ${tId}, InstanceID: ${instId}, Type: ${typeof tId}`);

			// Terminate session if on game-match OR if on tournament-lobby with an active tournament (ID != -42)
			// Note: We check if tId is defined to avoid false positives if currentTournament is null
			if (this.currentStep === 'game-match' || (this.currentStep === 'tournament-lobby' && tId !== undefined && tId !== null && tId !== -42)) {
				console.log("[beforeunload] Terminating session...");
				sessionStorage.setItem('was_active_session', 'true'); // Flag for the next reload
				this.terminateSession();
			}
		});

		window.addEventListener('hashchange', async () => {
			this.loadStep();
		});

		window.addEventListener("pageshow", (event) => {
			if (event.persisted && location.hash === '#login') {
				console.log("Recargando el step de login");
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
				console.log('footer cargado');
			} else {
				console.error('Error al cargar el footer:', footerResponse.statusText);
			}
		} catch (error) {
			console.error('Error al cargar el footer:', error);
		}
	}

	async navigate(step: string) {
		if (location.hash === `#${step}`) return; // no-op if already there
		location.hash = `#${step}`; // hashchange handler will call loadStep
	}

	private terminateSession() {
		console.warn("[DEBUG] terminateSession called");
		// Kill Game
		if (this.currentGame) {
			if (this.currentGame.isGameActive?.()) {
				try {
					this.currentGame.getGameConnection()?.killGameSession(this.currentGame.getGameLog().id);
				} catch (e) { console.error("Error killing game session:", e); }
			}
			// Cleanup match UI if exists
			try {
				const match = this.currentGame.getGameMatch?.();
				if (match) {
					if (typeof match.updatePlayerActivity === 'function') match.updatePlayerActivity(false);
					if (typeof match.destroy === 'function') match.destroy();
				}
			} catch (e) { console.error("Error destroying match UI:", e); }
		}

		// Kill Tournament
		if (this.currentTournament && this.currentTournament.getTournamentId && this.currentTournament.getTournamentId()! > -42) {
			try {
				const ui = this.currentTournament.getTournamentUI?.();
				if (ui && typeof ui.resetTournament === 'function') {
					ui.resetTournament();
				} else if (typeof this.currentTournament.resetTournament === 'function') {
					this.currentTournament.resetTournament();
				}
			} catch (e) { console.error("Error resetting tournament:", e); }
		}

		this.currentGame = null;
	}

	async loadStep() {
		let step = location.hash.replace('#', '') || 'home';
		console.warn(`[loadStep] Navigating from ${this.currentStep} to ${step}. TournamentID: ${this.currentTournament?.getTournamentId()}, InstanceID: ${(this.currentTournament as any)?.instanceId}`);

		// Determine if the transition is safe (Tournament Flow)
		const isTournamentSetup = this.currentStep === 'tournament-lobby' && this.currentTournament?.getTournamentId() === -42;
		const isTournamentFlow = (this.currentStep === 'tournament-lobby' && step === 'game-match' && this.currentTournament?.getTournamentId() !== -42);
		// Handle Navigation away from active session
		if ((this.currentStep === 'game-match' || this.currentStep === 'tournament-lobby') && step !== this.currentStep) {
			if (isTournamentSetup) {
				// Safe to leave setup
			} else if (isTournamentFlow) {
				// Safe transition between lobby and match
				// If leaving game-match, we must destroy the match UI to stop loops, but NOT kill the session
				if (this.currentStep === 'game-match') {
					try {
						const match = this.currentGame?.getGameMatch?.();
						if (match) {
							if (typeof match.updatePlayerActivity === 'function') match.updatePlayerActivity(false);
							if (typeof match.destroy === 'function') match.destroy();
						}
					} catch (e) { console.error("Error destroying match UI:", e); }
				}
			} else if (this.currentStep === 'tournament-lobby') {
				this.terminateSession();
				showMessage("You navigated away from active tournament\nTournament has been terminated", 6000);
			} else if (!this.currentGame?.isGameActive()) {
				// Safe to leave setup
			} else {
				// Unsafe transition - terminate
				this.terminateSession();
				showMessage("You navigated away from active session\nSession has been terminated", 6000);
			}
		}

		// If the hash didn't change effectively, avoid reloading the same step (prevents duplicate listeners)
		if (this.currentStep === step) {
			console.debug('SPA: same step detected, skipping reload for', step);
			return;
		}

		this.currentStep = step;

		const routeConfig = this.routes[step];
		if (routeConfig) {
			const module = await import(`./${routeConfig.module}`);
			let stepInstance;
			if (step === 'game-match') {
				// If a match instance already exists, destroy it to avoid duplicate listeners/intervals
				try {
					const existingMatch = this.currentGame?.getGameMatch?.();
					if (existingMatch && typeof existingMatch.destroy === 'function') {
						existingMatch.destroy();
					}
				} catch { }

				if (!this.currentGame || !this.currentGame.isGameActive?.()) {
					//this.currentStep = 'home';
					this.terminateSession();
					showMessage('No active game session found. Redirected to home', 6000);
					this.navigate('home');
					return;
				}

				stepInstance = new module.default(this.currentGame, this.currentTournament);
				if (this.currentGame && stepInstance)
					this.currentGame.setGameMatch(stepInstance);
			}
			else if (step === 'game-lobby') {
				stepInstance = new module.default('app-container');
				this.currentGame = stepInstance;
			}
			else if (step === 'tournament-lobby') {
				// Reuse existing tournament instance if active to preserve state
				if (this.currentTournament && this.currentTournament.getTournamentId() !== -42) {
					stepInstance = this.currentTournament;
					console.log('Reusing active tournament instance');
				} else {
					stepInstance = new module.default('app-container');
					this.currentTournament = stepInstance;
					console.log('Created new tournament instance');
				}
			}
			else
				stepInstance = new module.default('app-container');
			const user = await stepInstance.checkAuth();
			if (user) {
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

			// If we reused the tournament instance, we might need to restore the view (bracket)
			if (step === 'tournament-lobby' && this.currentTournament && this.currentTournament.getTournamentId() !== -42) {
				try {
					this.currentTournament.resumeTournament();
				} catch (e) { console.error("Error resuming tournament UI:", e); }
			}

		} else {
			showMessage('URL does not exist', 6000);
			window.location.hash = '#home';
		}
	}
	public static getInstance(): SPA {
		return SPA.instance;
	}

	public setCurrentStep(step: string) {
		this.currentStep = step;
	}
}

document.addEventListener('DOMContentLoaded', () => new SPA('content'));
