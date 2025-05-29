/**
 * GameConnection.ts -> WebSocket connection handling
 */

export class GameConnection
{
	private game: any;
	private socket: WebSocket | null = null;
	private connectionStat: boolean = false;

	constructor(game: any)
	{
		this.game = game;
	}

	async establishConnection(): Promise<void>
	{
		return new Promise((resolve, reject) => {
			// 1. Socket create/registred - ping test - buttons appear
			this.socket = new WebSocket(`https://${window.location.host}/back/ws/game`);
			// 1.1 Set what we want to happen on open socket (at first connected)
			this.socket.onopen = () => {
				console.log('Connected to game server');
				// Send ping to test connection
				this.socket?.send(JSON.stringify({
					type: 'PING',
					timestamp: Date.now()
				}));
				this.connectionStat = true;
				resolve();
			};
		
			// 2. Setting message received handler for all desired cases
			this.socket.onmessage = (event) => {
				console.log("Message received from server:", event.data);
				try
				{
					const data = JSON.parse(event.data);
					console.log("Parsed server message:", data);
					switch(data.type)
					{
						case 'GAME_INIT':
							console.log("Game initialized:", data);
							// if (data.playerNumber)
							// 	this.playerNumber = data.playerNumber;
							// if (data.config)
							// 	console.log("Server confirmed game config:", data.config);
							break ;
						case 'GAME_STATE':
							this.game.renderer.renderGameState(data.state);
							break ;
						case 'GAME_START':
							// if (data.players && data.players.player1)
							// 	this.game.setPlayerInfo('player1', data.players.player1);
							// if (data.players && data.players.player2)
							// 	this.game.setPlayerInfo('player2', data.players.player2);
							console.log("Game started:", data);
							this.game.startGameSession();
							break ;
						case 'GAME_END':
							this.game.endGameSession(data.result);
							this.game.ui.showGameResults(this.game.getGameLog());
							break ;
						case 'SERVER_TEST':
							console.log("Server test message:", data.message);
							// Respond to confirm bidirectional communication
							this.socket?.send(JSON.stringify({
								type: 'PING',
								message: 'Client response to server test'
							}));
							break ;
						case 'PONG':
							console.log("Server responded to ping");
							break ;
						default:
							console.log(`Received message with type: ${data.type}`);
					}
				}
				catch (error) {
					console.error("Error parsing server message:", error);
				}
			};

			// 3. Error handler
			this.socket.onerror = (error) => {
				console.error("WebSocket error:", error);
				reject(error); // Reject the promise on error
			};

			// 4. Connection closed handler: set bool flag to false and hide play buttons
			this.socket.onclose = (event) => {
				console.log(`WebSocket connection closed: Code ${event.code}${event.reason ? ' - ' + event.reason : ''}`);
				this.connectionStat = false;
			};
		})
	}

	/**
	 * Send game mode selection to server with optional metadata
	 * @param mode Game mode
	 * @param tournamentId Optional tournament ID
	 */
	public joinGame(mode: string, tournamentId?: number): void
	{
		if (!this.socket || !this.connectionStat)
		{
			console.error("Cannot join game: connection not ready");
			return ;
		}
		this.game.setGameMode(mode);
		if (tournamentId)
			this.game.setTournamentId(tournamentId);
		const	joinMsg: any = {
			type: 'JOIN_GAME',
			mode: mode,
			config: this.game.log.config
		};
		if (tournamentId)
			joinMsg.tournamentId = tournamentId;
		this.socket.send(JSON.stringify(joinMsg));
	}

	public destroy()
	{
		if (this.socket)
			this.socket.close();
	}
}
