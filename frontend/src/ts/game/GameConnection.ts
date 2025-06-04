/**
 * GameConnection.ts -> WebSocket connection handling
 */

export class GameConnection
{
	private game: any;
	private socket: WebSocket | null = null;
	private connectionStat: boolean = false;
	private pendingUserInfoResolve: ((user: any) => void) | null = null;

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
						case 'USER_INFO':
							if (this.pendingUserInfoResolve)
							{
								this.pendingUserInfoResolve(data.user);
								this.pendingUserInfoResolve = null;
							}
							break ;
						case 'GAME_INIT':
							console.log("Game initialized:", data);
							break ;
						case 'GAME_STATE':
							this.game.renderer.renderGameState(data.state);
							break ;
						case 'GAME_START':
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
		console.log("GAME LOG BEFORE JOIN SENDING: ", this.game.log);
		if (!this.socket || !this.connectionStat)
		{
			console.error("Cannot join game: connection not ready");
			return ;
		}
		if (tournamentId)
			this.game.setTournamentId(tournamentId);
		const	joinMsg: any = {
			type: 'JOIN_GAME',
			mode: mode,
			roomId : this.game.log.id,
			player1: this.game.log.player1,
			player2: this.game.log.player2,
			config: this.game.log.config
		};
		if (tournamentId)
			joinMsg.tournamentId = tournamentId;
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
			this.socket.close();
	}
}
