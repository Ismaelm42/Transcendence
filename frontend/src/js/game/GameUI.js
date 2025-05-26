/**
 * GameUI.ts -> UI setup and event listeners
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class GameUI {
    constructor(game) {
        this.game = game;
    }
    initializeUI(appElement) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    setupEventListeners() {
        var _a, _b;
        // Keyboard input
        document.addEventListener('keydown', (e) => {
            if (!this.game.connection.socket)
                return;
            const input = {
                up: e.key === 'ArrowUp',
                down: e.key === 'ArrowDown'
            };
            this.game.connection.socket.send(JSON.stringify({
                type: 'PLAYER_INPUT',
                input
            }));
        });
        // Game mode buttons
        (_a = document.getElementById('play-ai')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
            this.joinGame('1vAI');
        });
        (_b = document.getElementById('play-online')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
            this.joinGame('1v1');
        });
    }
    joinGame(mode) {
        if (!this.game.connection.socket || !this.game.connection.connectionStat) {
            console.error("Cannot join game: connection not ready");
            return;
        }
        console.log(`Requesting to join ${mode} game...`);
        this.game.connection.socket.send(JSON.stringify({
            type: 'JOIN_GAME',
            mode: mode
        }));
        const selectGame = document.getElementById('select-game');
        const gameDiv = document.getElementById('game-container');
        if (selectGame)
            selectGame.style.display = "none";
        if (gameDiv)
            gameDiv.style.display = "block";
        this.game.renderer.canvas = document.getElementById('game-canvas');
        if (this.game.renderer.canvas)
            this.game.renderer.ctx = this.game.renderer.canvas.getContext('2d');
    }
}
