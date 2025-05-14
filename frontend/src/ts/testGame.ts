import { Step } from "./stepRender.js";

export default class Game extends Step
{
	private socket: WebSocket | null = null;
	private currentState: any = null;

	async render(appElement: HTMLElement): Promise<void> {
		appElement.innerHTML = `
			<div class="game-container">
				<!-- Paddles -->
				<div id="left-paddle" class="paddle"></div>
				<div id="right-paddle" class="paddle"></div>
				
				<!-- Ball -->
				<div id="ball" class="ball"></div>
				
				<!-- Score -->
				<div id="score" class="score">0 - 0</div>
				
				<!-- Controls -->
				<div class="controls">
					<button id="play-ai">Play vs AI</button>
					<button id="play-online">Play Online</button>
				</div>
			</div>
		`;
		this.setupEventListeners();
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
			this.connectToGame('1vAI');
		});
		
		document.getElementById('play-online')?.addEventListener('click', () => {
			this.connectToGame('1v1');
		});
	}

	private connectToGame(mode: string) {
		this.socket = new WebSocket(`https://${window.location.host}/back/ws/game`);

		this.socket.onmessage = (event) => {
			const data = JSON.parse(event.data);
			if (data.type === 'GAME_STATE')
				this.renderGameState(data.state);
		};

		this.socket.onopen = () => {
			this.socket?.send(JSON.stringify({
				type: 'JOIN_GAME',
				mode
			}));
		};
	}

	private renderGameState(state: any)
	{
		// Update paddles
		const leftPaddle = document.getElementById('left-paddle');
		const rightPaddle = document.getElementById('right-paddle');
		
		if (leftPaddle) leftPaddle.style.top = `${state.paddles.player1.y * 100}%`;
		if (rightPaddle) rightPaddle.style.top = `${state.paddles.player2.y * 100}%`;

		// Update ball
		const ball = document.getElementById('ball');
		if (ball) {
			ball.style.left = `${state.ball.x * 100}%`;
			ball.style.top = `${state.ball.y * 100}%`;
		}

		// Update score
		const score = document.getElementById('score');
		if (score) score.textContent = `${state.scores[0]} - ${state.scores[1]}`;
	}

	public destroy()
	{
		if (this.socket)
			this.socket.close();
	}
}
