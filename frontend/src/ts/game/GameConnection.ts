/**
 * GameConnection.ts -> WebSocket connection handling
 */
import { SPA } from '../spa/spa.js';
import Game from './Game.js'

// This is a variable to store the first websocket connection
// so we can use the same one during the whole browser lifecycle
// (if page close or reloaded, socket is closed and lost)
let globalGameSocket: WebSocket | null = null;

export class GameConnection
{
	private game: Game;
	public	socket: WebSocket | null = null;
	public	connectionStat: boolean = false;
	public	pendingUserInfoResolve: ((user: any) => void) | null = null;

	constructor(game: Game)
	{
		this.game = game;
	}

	async establishConnection(): Promise<void>
	{
		return new Promise<void>((resolve, reject) => {
			// 0. Check if there is already an existing socket, to avoid creating new one
			if (globalGameSocket && globalGameSocket.readyState === WebSocket.OPEN)
			{
				console.log("Websocket reused =)");
				this.socket = globalGameSocket;
				this.connectionStat = true;
				// Remove old handlers before assigning new ones
				this.socket.onmessage = null;
				this.socket.onopen = null;
				this.socket.onerror = null;
				this.socket.onclose = null;
				resolve();
				return ;
			}
			// 1. Socket create/registred - ping test - buttons appear
			this.socket = new WebSocket(`https://${window.location.host}/back/ws/game`);
			globalGameSocket = this.socket;
			this.socket.onopen = () => {
				console.log('New socket connected to game server');
				this.connectionStat = true;
				resolve();
			};
			this.socket.onerror = (error) => {
				console.error("WebSocket error:", error);
				reject(error);
			};
			this.socket.onclose = (event) => {
				console.log(`WebSocket connection closed: Code ${event.code}${event.reason ? ' - ' + event.reason : ''}`);
				this.connectionStat = false;
				if (globalGameSocket === this.socket)
					globalGameSocket = null;
			};
		}).then(() => {
			// Always assign the message handler after connection is established
			if (this.socket) 
			{
				this.socket.onmessage = (event) => {
					console.log("Message received from server:", event.data);
					try
					{
						const data = JSON.parse(event.data);
						console.log("Parsed server message:", data);
						switch(data.type)
						{
							case 'USER_INFO':
								if (this.pendingUserInfoResolve)
								{
									this.pendingUserInfoResolve(data.user);
									this.pendingUserInfoResolve = null;
									this.game.setOnlineId(data.user.id);
								}
								else
									console.warn('No pendingUserInfoResolve to call!');
								break ;
							case 'GAME_INIT':
								const spa = SPA.getInstance();
								if (data.metadata)
									this.game.setGameLog(data.metadata);
								if (window.location.hash === '#game-match' && spa.currentGame?.getGameMatch())
								{
									const appElement = document.getElementById('app-container');
									if (appElement)
										spa.currentGame.getGameMatch()?.render(appElement);
								}
								else 
									spa.navigate('game-match');
								console.log("Game initialized:", data);
								break ;
							case 'GAME_STATE':
								this.game.getGameRender().renderGameState(data.state);
								break ;
							case 'GAME_START':
								console.log("Game started:", data);
								this.game.startGameSession();
								break ;
							case 'GAME_END':
								this.game.endGameSession(data.result);
								this.game.getGameMatch()?.showGameResults(this.game.getGameLog());
								break ;
							case 'SERVER_TEST':
								console.log("Server test message:", data.message);
								this.socket?.send(JSON.stringify({
									type: 'PING',
									message: 'Client response to server test'
								}));
								break ;
							case 'PONG':
								console.log("Server responded to ping");
								break ;
							case 'GAMES_LIST':
								this.game.getGameUI().updateLobby(data.games || []);
								break ;
							case 'READY_STATE':
								this.game.getGameMatch()?.updateReadyModal(data.playerDetails, data.readyStates);
								break ;
							case 'GAME_COUNTDOWN':
								const readyModal = document.getElementById('ready-modal');
								if (readyModal)
								{
									readyModal.style.display = 'none';
									this.game.getGameMatch()?.stopReadyStatePolling();
								}
								this.game.getGameMatch()?.showCountdown(data.seconds || 3);
								break ;
							case 'GAME_PAUSED':
								this.game.getGameMatch()?.showPauseModal(data.reason, data.userId);
								break ;
							case 'GAME_RESUMED':
								this.game.getGameMatch()?.hidePauseModal();
								break ;
							default:
								console.log(`Received message with type: ${data.type}`);
						}
					}
					catch (error) {
						console.error("Error parsing server message:", error);
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
	public joinGame(gameId?: string): void
	{
		if (!this.socket || !this.connectionStat)
		{
			console.error("Cannot join game: connection not ready");
			return ;
		}
		if (gameId)
		{
			this.game.setGameMode('remote');
			const	joinMsg: any = {
				type: 'JOIN_GAME',
				roomId : gameId
			};
			this.socket.send(JSON.stringify(joinMsg));
			return ;
		}
	
		const 	metadata = this.game.getGameLog();
		const	joinMsg: any = {
			type: 'JOIN_GAME',
			mode: metadata.mode,
			roomId : metadata.id,
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
	public	async parseUserInfo(data: {email: string, password: string} | null) : Promise<any>
	{
		let	mode = 'local';
		if (data)
		{
			try
			{
				if (await this.checkPlayer(data))
					mode = 'external';
			}
			catch (error){
				console.error("Error while checking external player:", error);
			}
		}
		return new Promise((resolve) => {
			this.pendingUserInfoResolve = resolve;
			this.socket?.send(JSON.stringify({
				type: 'GET_USER',
				mode: mode,
				email: data?.email
			}));
		});
	}

	public async	checkPlayer(data: {email: string, password: string})
	{
		try
		{
			const response = await fetch("https://localhost:8443/back/verify_user", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});
			if (!response.ok)
			{
				const result = await response.json();
				console.log(`Error: ${result.message}`);
				return (false);
			}
			else
				return (true);
		}
		catch (error){
			console.error("Error while verifying:", error);
		}
	};
	
	public destroy()
	{
		if (this.socket)
		{
			this.socket.onmessage = null;
			this.socket.onopen = null;
			this.socket.onerror = null;
			this.socket.onclose = null;
			this.socket.close();
		}
		this.pendingUserInfoResolve = null;
	}
}
