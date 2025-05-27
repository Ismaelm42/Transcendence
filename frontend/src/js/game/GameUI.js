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
import { GameControllers } from './GameControllers.js';
export class GameUI {
    constructor(game) {
        this.game = game;
        this.controllers = new GameControllers(game);
    }
    initializeUI(appElement) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch("../../html/game/gameUI.html");
                if (!response.ok)
                    throw new Error("Failed to load the game UI HTML file");
                const htmlContent = yield response.text();
                appElement.innerHTML = htmlContent;
            }
            catch (error) {
                console.error("Error loading game UI:", error);
                appElement.innerHTML = `<div class="error-container">Failed to load game interface. Please try again.</div>`;
            }
        });
    }
    // Sets up event listeners for game mode buttons, which after will also set controllers
    setupEventListeners() {
        var _a, _b, _c;
        // Game mode buttons
        (_a = document.getElementById('play-ai')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
            this.controllers.setupControllers('1vAI');
            this.joinGame('1vAI');
        });
        (_b = document.getElementById('play-1v1')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
            this.controllers.setupControllers('1v1');
            this.joinGame('1v1');
        });
        (_c = document.getElementById('play-online')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => {
            this.controllers.setupControllers('remote');
            this.joinGame('remote');
        });
        // Add tournament button listener if finally implemented here
    }
    joinGame(mode) {
        if (!this.game.connection.socket || !this.game.connection.connectionStat) {
            console.error("Cannot join game: connection not ready");
            return;
        }
        this.game.mode = mode;
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
