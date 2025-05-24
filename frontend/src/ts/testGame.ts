import { Step } from "./stepRender.js";

export default class Game extends Step
{
	private socket: WebSocket | null = null;
	private connectionStat: boolean = false;

	private canvas: HTMLCanvasElement | null = null;
	private ctx: CanvasRenderingContext2D | null = null;
	private gameState: any = null;
	private animationFrameId: number | null = null;

	private lastKnownState: any = null;
	private stateTimestamp: number = 0;

	async render(appElement: HTMLElement): Promise<void> {
		appElement.innerHTML = `
			<!-- Game setup - config -->
			<div class="select-game" id="select-game" style="display: block;">
				<h1 class="text-center text-white mb-4 text-4xl font-bold font-[Tektur]">Select Game Mode</h1>
				<div class="flex flex-col gap-4 items-center">
					<button id="play-ai" style="width: 200px" class="h-12 py-3 bg-blue-500 text-white border-none rounded hover:bg-blue-600 font-bold cursor-pointer text-base flex justify-center items-center">Play vs AI</button>
					<button id="play-online" style="width: 200px" class="h-12 py-3 bg-green-500 text-white border-none rounded hover:bg-green-600 font-bold cursor-pointer text-base flex justify-center items-center">Play Online</button>
				</div>
			</div>
			<div class="game-container" id="game-container" style="display: none; width: 100%; max-width: 1200px; margin: 0 auto; text-align: center;">
				<canvas id="game-canvas" width="800" height="600" style="background-color: black; margin: 0 auto; display: block; max-width: 100%; height: auto;"></canvas>
			</div>
		`;
		await this.establishConnection();
		this.setupEventListeners();
	}

	/**
	 * As a first approach, let's establish and registrer the websocket connection as soon
	 * as the #test root is reached, this means create a new WebSocket, then 
	 */
	private async	establishConnection() : Promise<void>
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
							this.renderGameState(data.state);
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

	private setupEventListeners()
	{
		// Keyboard input
		document.addEventListener('keydown', (e) => {
			if (!this.socket) return;
			
			const input = {
				up: e.key === 'ArrowUp',
				down: e.key === 'ArrowDown'
			};
			
			this.socket.send(JSON.stringify({
				type: 'PLAYER_INPUT',
				input
			}));
		});

		// Game mode buttons
		document.getElementById('play-ai')?.addEventListener('click', () => {
			this.joinGame('1vAI');
		});
		
		document.getElementById('play-online')?.addEventListener('click', () => {
			this.joinGame('1v1');
		});
	}

	private joinGame(mode: string)
	{
		if (!this.socket || !this.connectionStat)
		{
			console.error("Cannot join game: connection not ready");
			return;
		}
		console.log(`Requesting to join ${mode} game...`);
		this.socket.send(JSON.stringify({
			type: 'JOIN_GAME',
			mode: mode
		}));
		const	selectGame = document.getElementById('select-game');
		const	gameDiv = document.getElementById('game-container');
		if (selectGame)
			selectGame.style.display = "none";
		if (gameDiv)
			gameDiv.style.display = "block";
		this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
		if (this.canvas)
			this.ctx = this.canvas.getContext('2d');
	}

	private renderGameState(state: any)
	{
		console.log("Received new game state:", state);
		this.lastKnownState = this.gameState;
		this.gameState = state;
		this.stateTimestamp = Date.now();
		if (!this.canvas)
		{
			console.log("Canvas not found, attempting to initialize");
			this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
			if (this.canvas) {
				console.log("Canvas found with dimensions:", this.canvas.width, "x", this.canvas.height);
				this.ctx = this.canvas.getContext('2d');
				if (!this.ctx) {
					console.error("Failed to get canvas context");
					return;
				}
				// Start the animation loop if this is the first state update
				this.startRenderLoop();
			} else {
				console.error("Could not find canvas element");
				return;
			}
		}
		// Force a redraw with the new state
		this.drawGame();
	}

	private startRenderLoop() 
	{
		// Cancel any existing animation frame
		if (this.animationFrameId !== null)
			cancelAnimationFrame(this.animationFrameId);
		const renderLoop = () => {
			this.drawGame();
			this.animationFrameId = requestAnimationFrame(renderLoop);
		};
		this.animationFrameId = requestAnimationFrame(renderLoop);
	}

	private drawGame()
	{
		if (!this.ctx || !this.canvas) {
			console.error("Cannot draw: missing context or canvas");
			return;
		}
		
		if (!this.gameState) {
			console.error("Cannot draw: missing game state");
			return;
		}
		
		console.log("Drawing game with state:", this.gameState);
		
		// Clear the canvas
		this.ctx.fillStyle = "black";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		
		// Draw elements
		this.drawCenterLine();
		this.drawPaddles();
		this.drawBall();
		this.drawScore();
	}

	private drawPaddles()
	{
		if (!this.ctx || !this.canvas || !this.gameState || !this.gameState.paddles) {
			console.error("Cannot draw paddles");
			return;
		}
		
		const paddleWidth = Math.round(this.canvas.width * 0.025);  // 2.5% of screen width
		const paddleHeight = Math.round(this.canvas.height * 0.15); // 15% of screen height
		
		const leftPaddleX = Math.round(this.canvas.width * 0.03);
		const rightPaddleX = Math.round(this.canvas.width * 0.97) - paddleWidth;
				
		this.ctx.fillStyle = "white";
		
		// Draw left paddle (player1)
		if (this.gameState.paddles.player1) {
			const y = this.gameState.paddles.player1.y * this.canvas.height;
			const leftPaddleY = Math.round(y - (paddleHeight / 2));
			this.ctx.fillRect(leftPaddleX, leftPaddleY, paddleWidth, paddleHeight);
		}
		
		// Draw right paddle (player2)
		if (this.gameState.paddles.player2) {
			const y = this.gameState.paddles.player2.y * this.canvas.height;
			const rightPaddleY = Math.round(y - (paddleHeight / 2));
			this.ctx.fillRect(rightPaddleX, rightPaddleY, paddleWidth, paddleHeight);
		}
	}

	private drawBall()
	{
		if (!this.ctx || !this.canvas || !this.gameState || !this.gameState.ball) {
			console.error("Cannot draw ball");
			return;
		}
		
		// Ball position is in normalized coordinates (0-1 range)
		const ballX = this.gameState.ball.x * this.canvas.width;
		const ballY = this.gameState.ball.y * this.canvas.height;
		
		// Keep the ball radius consistent with backend collision detection
		const ballRadius = Math.round(this.canvas.height * 0.015);
		
		// Draw a highlight circle to better visualize the ball's collision boundary
		this.ctx.beginPath();
		this.ctx.arc(ballX, ballY, ballRadius + 1, 0, Math.PI * 2);
		this.ctx.fillStyle = "rgba(255, 255, 255, 0.3)"; // Semi-transparent white
		this.ctx.fill();
		this.ctx.closePath();
		
		// Draw the main ball
		this.ctx.beginPath();
		this.ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
		this.ctx.fillStyle = "white";
		this.ctx.fill();
		this.ctx.closePath();
	}

	private drawScore()
	{
		if (!this.ctx || !this.canvas || !this.gameState || !this.gameState.scores) {
			console.error("Cannot draw scores:");
			return;
		}

		const player1Score = this.gameState.scores[0];
    	const player2Score = this.gameState.scores[1];

		this.ctx.fillStyle = "white";
		this.ctx.font = "60px Tektur, sans-serif";
		
		// Position scores on their respective sides (about 25% in from each edge)
		const leftScoreX = Math.round(this.canvas.width * 0.25);
		const rightScoreX = Math.round(this.canvas.width * 0.75);
		const scoreY = 80; // Position from top

		this.ctx.textAlign = "center";
		this.ctx.fillText(`${player1Score}`, leftScoreX, scoreY);
    	this.ctx.fillText(`${player2Score}`, rightScoreX, scoreY);
	}

	private drawCenterLine() {
		if (!this.ctx || !this.canvas) return;
		
		this.ctx.strokeStyle = 'white';
		this.ctx.setLineDash([10, 10]); // Create dashed line
		this.ctx.beginPath();
		this.ctx.moveTo(this.canvas.width / 2, 0);
		this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
		this.ctx.stroke();
		this.ctx.setLineDash([]); // Reset line style
	}

	public destroy()
	{
		if (this.socket)
			this.socket.close();
		if (this.animationFrameId !== null)
		{
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
	}
}
