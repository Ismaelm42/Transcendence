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
						case 'GAME_STATE':
							this.game.renderer.renderGameState(data.state);
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

	public destroy()
	{
		if (this.socket)
			this.socket.close();
	}
}
