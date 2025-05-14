var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Step } from "./stepRender.js";
export default class Game extends Step {
    constructor() {
        super(...arguments);
        this.socket = null;
        this.currentState = null;
    }
    render(appElement) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    setupEventListeners() {
        var _a, _b;
        // Keyboard input
        document.addEventListener('keydown', (e) => {
            if (!this.socket)
                return;
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
        (_a = document.getElementById('play-ai')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
            this.connectToGame('1vAI');
        });
        (_b = document.getElementById('play-online')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
            this.connectToGame('1v1');
        });
    }
    connectToGame(mode) {
        this.socket = new WebSocket(`https://${window.location.host}/back/ws/game`);
        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'GAME_STATE')
                this.renderGameState(data.state);
        };
        this.socket.onopen = () => {
            var _a;
            (_a = this.socket) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify({
                type: 'JOIN_GAME',
                mode
            }));
        };
    }
    renderGameState(state) {
        // Update paddles
        const leftPaddle = document.getElementById('left-paddle');
        const rightPaddle = document.getElementById('right-paddle');
        if (leftPaddle)
            leftPaddle.style.top = `${state.paddles.player1.y * 100}%`;
        if (rightPaddle)
            rightPaddle.style.top = `${state.paddles.player2.y * 100}%`;
        // Update ball
        const ball = document.getElementById('ball');
        if (ball) {
            ball.style.left = `${state.ball.x * 100}%`;
            ball.style.top = `${state.ball.y * 100}%`;
        }
        // Update score
        const score = document.getElementById('score');
        if (score)
            score.textContent = `${state.scores[0]} - ${state.scores[1]}`;
    }
    destroy() {
        if (this.socket)
            this.socket.close();
    }
}
