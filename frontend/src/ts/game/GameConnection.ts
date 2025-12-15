/**
 * GameConnection.ts -> WebSocket connection handling
 */
import { SPA } from '../spa/spa.js';
import Game from './Game.js'
import type { GameData } from './types.js';
import { showMessage } from '../modal/showMessage.js';

// This is a variable to store the first websocket connection
// so we can use the same one during the whole browser lifecycle
// (if page close or reloaded, socket is closed and lost)
let globalGameSocket: WebSocket | null = null;

export class GameConnection {
	private game: Game;	// Reference to the Game instance
	public socket: WebSocket | null = null; 	// WebSocket instance
	public connectionStat: boolean = false; 	// Connection status
	public activeGamesDetails: GameData[] | null = null;
	/**
	 * A callback function that is invoked to resolve pending user information requests.
	 * 
	 * When set, this function should be called with the user data once it becomes available.
	 * If there is no pending request, this property is `null`.
	 *
	 * @remarks
	 * This is typically used in asynchronous flows where user information needs to be fetched or confirmed before proceeding.
	 *
	 * @param user - The user information object to be passed to the resolver.
	 */
	public pendingUserInfoResolve: ((user: any) => void) | null = null;
	/**
	 * Creates an instance of GameConnection.
	 * @param game - The Game instance that this connection will manage.
	 */
	constructor(game: Game) {
		this.game = game;
	}

	async establishConnection(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			// 0. Check if there is already an existing socket, to avoid creating new one
			if (globalGameSocket && globalGameSocket.readyState === WebSocket.OPEN)
			{
				this.socket = globalGameSocket;
				this.connectionStat = true;
				// Remove old handlers before assigning new ones
				this.socket.onmessage = null;
				this.socket.onopen = null;
				this.socket.onerror = null;
				this.socket.onclose = null;
				resolve();
				return;
			}
			// 1. Socket create/registred - ping test - buttons appear
			this.socket = new WebSocket(`https://${window.location.host}/back/ws/game`);
			globalGameSocket = this.socket;
			this.socket.onopen = () => {
				this.connectionStat = true;
				resolve();
			};
			this.socket.onerror = (error) => {
				reject(error);
			};
			this.socket.onclose = (event) => {
				this.connectionStat = false;
				if (globalGameSocket === this.socket)
					globalGameSocket = null;
			};
		}).then(() => {
			// Always assign the message handler after connection is established
			if (this.socket) {
				this.socket.onmessage = (event) => {
					try {
						const data = JSON.parse(event.data);
						switch (data.type) {
							case 'USER_INFO':
								const userId = data?.user?.id;
								// Fix: On 1v1 mode, we fetch player2 info but we shouldn't overwrite the main session ID (player1)
								// So we only update onlineId if we are not in 1v1 mode OR if we don't have an ID yet
								const is1v1 = this.game.getGameLog().mode === '1v1';
								const hasId = this.game.getOnlineId() !== null;

								if (userId !== undefined && userId !== null) {
									if (!is1v1 || !hasId)
										this.game.setOnlineId(String(userId));
								}
								if (this.pendingUserInfoResolve) {
									this.pendingUserInfoResolve(data.user);
									this.pendingUserInfoResolve = null;
								}
								this.updateHostStatus();
								break;
							case 'GAME_INIT':
								const spa = SPA.getInstance();
								if (data.metadata)
									this.game.setGameLog(data.metadata);
								this.game.setReadyState(true);
								if (!this.game.getOnlineId() && !this.pendingUserInfoResolve) {
									this.pendingUserInfoResolve = () => { };
									this.socket?.send(JSON.stringify({ type: 'GET_USER', mode: 'local' }));
								}
								if (window.location.hash === '#game-match' && spa.currentGame?.getGameMatch()) {
									const appElement = document.getElementById('app-container');
									if (appElement)
										spa.currentGame.getGameMatch()?.render(appElement);
								}
								else
									spa.navigate('game-match');
								this.updateHostStatus();
								// If rejoining a running 1vAI match, ensure controllers and AI start
								try {
									const isAI = (data?.metadata?.mode === '1vAI') || (this.game.getGameLog().mode === '1vAI');
									if (isAI && data?.metadata?.startTime) {
										setTimeout(() => {
											const spa2 = SPA.getInstance();
											const match = spa2.currentGame?.getGameMatch();
											if (match) {
												match.controllers.setupControllers();
												match.startAIIfNeeded();
											}
										}, 150);
									}
								} catch { }
								break;
							case 'GAME_STATE':
								// Mark game as active to enable leave guards on reload/navigation
								this.game.setGameLog({ readyState: true } as any);
								this.game.getGameRender().renderGameState(data.state);
								break;
							case 'GAME_START':
								this.game.startGameSession();
								break;
							case 'GAME_END':
								// Kill tournament - tournament.resetTournament()
								this.game.endGameSession(data.result);
								this.game.getGameMatch()?.showGameResults(this.game.getGameLog());
								break;
							case 'SERVER_TEST':
								this.socket?.send(JSON.stringify({
									type: 'PING',
									message: 'Client response to server test'
								}));
								break;
							case 'PONG':
								break ;
							case 'GAMES_LIST':
								this.game.getGameUI().updateLobby(data.games || []);
								break;
							case 'READY_STATE':
								this.game.getGameMatch()?.updateReadyModal(data.playerDetails, data.readyStates);
								break;
							case 'GAME_COUNTDOWN':
								this.game.getGameUI()?.showOnly('countdown-overlay');
								this.game.getGameMatch()?.stopReadyStatePolling();
								this.game.getGameMatch()?.showCountdown(data.seconds || 3, data.reason);
								break;
							case 'GAME_PAUSED':
								if (data.maxPauseDuration)
									this.game.pauseDuration = data.maxPauseDuration;
								// Mark as active (paused still counts as active match)
								this.game.setGameLog({ readyState: true } as any);
								this.game.getGameMatch()?.showPauseModal(data.reason, data.userId, data.pauseStartTime);
								break;
							case 'GAME_RESUMED':
								// Ensure leave guards are active post-resume and controllers are ready
								this.game.setGameLog({ readyState: true } as any);
								this.game.getGameMatch()?.hidePauseModal();
								try {
									const spa2 = SPA.getInstance();
									spa2.currentGame?.getGameMatch()?.controllers.setupControllers();
									if (this.game.getGameLog().mode === '1vAI')
										spa2.currentGame?.getGameMatch()?.startAIIfNeeded();
									// If we have a previous state but render loop not running (e.g. after reload), force a restart
									const renderer: any = this.game.getGameRender();
									if (renderer && !renderer.animationFrameId && (renderer.lastKnownState || renderer.gameState)) {
										const stateToUse = renderer.gameState || renderer.lastKnownState;
										if (stateToUse)
											renderer.renderGameState(stateToUse);
									}
									// Opportunistically request a fresh state snapshot if supported by backend
									try { this.socket?.send(JSON.stringify({ type: 'GET_STATE' })); } catch { }
								} catch { }
								break;
							case 'ERROR':
								showMessage(data.message, 5000);
								break;
							default:
								// Received message with unknown type; ignore silently
						}
					}
					catch (error) {
					}
				};
			}
		});
	}

	/**
	 * Send game mode selection to server with optional metadata
	 * @param mode Game mode
	 * @param tournamentId Optional tournament ID
	 */
	public joinGame(gameId?: string): void {
		if (!this.socket || !this.connectionStat) {
			return;
		}
		if (gameId) {
			this.game.setGameMode('remote');
			const joinMsg: any = {
				type: 'JOIN_GAME',
				roomId: gameId,
				mode: 'remote',
				isJoining: this.game.isJoining
			};
			this.socket.send(JSON.stringify(joinMsg));
			return;
		}

		const metadata = this.game.getGameLog();
		const joinMsg: any = {
			type: 'JOIN_GAME',
			mode: metadata.mode,
			roomId: metadata.id,
			player1: metadata.playerDetails.player1,
			player2: metadata.playerDetails.player2,
			config: metadata.config,
			tournamentId: metadata.tournamentId
		};
		this.socket.send(JSON.stringify(joinMsg));
	}

	/**
	 * Aux method to parse user main data from database, will use API endpoint
	 * If email and pass are passed (through setPlayerInfo) will change mode for API message
	 * The GET_USER endpoint triggers backend method that will store user object
	 */
	public async parseUserInfo(data: { email: string, password: string } | null): Promise<any> {
		let mode = 'local';
		if (data) {
			try {
				const check = await this.checkPlayer(data);
				if (check && check.success)
					mode = 'external';
			}
			catch (error) {
			}
		}
		/*User's information is requested, and a new promise is created:
		its resolve function is assigned to pendingUserInfoResolve.*/
		return new Promise((resolve) => {
			this.pendingUserInfoResolve = resolve;
			this.socket?.send(JSON.stringify({
				type: 'GET_USER',
				mode: mode,
				email: data?.email
			}));
		});
	}


	/**
	 * Verifies a player's credentials by sending a POST request to the backend.
	 *
	 * @param data - An object containing the player's email and password.
	 * @returns A promise that resolves to `true` if the credentials are valid, or `false` if invalid.
	 *          Logs errors to the console if the request fails or if the credentials are incorrect.
	 */
	public async checkPlayer(data: { email: string, password: string }) {
		try {
			const response = await fetch(`https://${window.location.host}/back/verify_user`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});
			if (!response.ok) {
				const result = await response.json();
				return ({ success: false, message: result.message});
				// return (false);
			}
			else
				return ({ success: true });
		}
		catch (error) {
			return ({ success: false, message: "Network error" });
		}
	};

	public checkActiveGameSessions(): Promise<{ sessions: GameData[], userId: number }> {
		return new Promise((resolve, reject) => {
			if (!this.socket || this.socket.readyState !== WebSocket.OPEN)
				return (reject('Socket not connected'));
			const handler = (event: MessageEvent) => {
				const data = JSON.parse(event.data);
				if (data.type === 'GAMES_DETAILS') {
					this.socket?.removeEventListener('message', handler);
					this.activeGamesDetails = data.games as GameData[];
					resolve({ sessions: this.activeGamesDetails, userId: data.userId });
				}
			};
			this.socket?.addEventListener('message', handler);
			this.socket?.send(JSON.stringify({ type: 'INSPECT_GAMES' }));
			setTimeout(() => {
				this.socket?.removeEventListener('message', handler);
				reject('Timeout waiting for GAMES_DETAILS');
			}, 3000);
		});
	}

	public killGameSession(gameId: string) {
		this.socket?.send(JSON.stringify({
			type: 'LEAVE_GAME'
		}));
	}

	/**
	 * Cleans up the WebSocket connection by removing all event handlers and closing the socket.
	 * Also clears any pending user information resolution callbacks.
	 *
	 * This method should be called when the connection is no longer needed to prevent memory leaks
	 * and ensure proper resource cleanup.
	 */
	public destroy() {
		if (this.socket) {
			this.socket.onmessage = null;
			this.socket.onopen = null;
			this.socket.onerror = null;
			this.socket.onclose = null;
			this.socket.close();
		}
		this.pendingUserInfoResolve = null;
	}

	private updateHostStatus() {
		const onlineId = this.game.getOnlineId();
		const player1 = this.game.getGameLog().playerDetails.player1;

		if (onlineId && player1 && player1.id) {
			if (String(onlineId) === String(player1.id)) {
				this.game.setGameIsHost(true);
			} else {
				this.game.setGameIsHost(false);
			}
		}
	}
}
