/**
 * GameMatch.ts -> canvas rendering, SPA step only for the match itself
 * 	it will rsetup listeners for controllers and render the game
 * 		+ showResults / rematch - back to lobby
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
import { SPA } from '../spa/spa.js';
import { Step } from "../spa/stepRender.js";
import { GameControllers } from './GameControllers.js';
export default class GameMatch extends Step {
    constructor(game) {
        super('game-container');
        this.game = game;
        this.renderer = game.getGameRender();
        this.controllers = new GameControllers(game);
        this.config = game.getGameConfig();
        this.log = game.getGameLog();
        this.ui = game.getGameUI();
        this.connection = game.getGameConnection();
    }
    initHTML(appElement) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch("../../html/game/gameMatch.html");
                if (!response.ok)
                    throw new Error("Failed to load the game UI HTML file");
                const htmlContent = yield response.text();
                appElement.innerHTML = htmlContent;
            }
            catch (error) {
                console.error("Error loading game UI:", error);
                appElement.innerHTML = `<div class="error-container">Failed to load game interface. Please try again.</div>`;
            }
            this.controllers.cleanup();
            this.controllers.setupControllers(this.log.mode);
        });
    }
    /**
     * Display game results when a game ends
     * @param gameData Complete game data
     */
    showGameResults(gameData) {
        var _a, _b, _c, _d;
        // Update the HTML content with actual game data logs
        const winnerElement = document.getElementById('winner-name');
        const scoreElement = document.getElementById('final-score');
        const durationElement = document.getElementById('game-duration');
        if (winnerElement)
            winnerElement.textContent = ((_a = gameData.result) === null || _a === void 0 ? void 0 : _a.winner) || 'Unknown';
        if (scoreElement) {
            const score = ((_b = gameData.result) === null || _b === void 0 ? void 0 : _b.score) || [0, 0];
            scoreElement.textContent = `${score[0]} - ${score[1]}`;
        }
        if (durationElement) {
            const duration = gameData.duration ? Math.floor(gameData.duration / 1000) : 0;
            durationElement.textContent = duration.toString();
        }
        // Show the results overlay
        this.ui.showOnly('game-results', 'flex');
        // Add event listeners for the buttons (these need to be set each time)
        (_c = document.getElementById('play-again-btn')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => {
            this.ui.showOnly('game-container');
            this.rematchGame();
        });
        (_d = document.getElementById('return-lobby-btn')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => {
            SPA.getInstance().navigate('game-lobby');
        });
    }
    /**
     * Reset the game to start a new one
     */
    rematchGame() {
        let rematchLog;
        rematchLog = this.game.getGameLog();
        rematchLog.startTime = 0;
        rematchLog.duration = 0;
        rematchLog.result = { winner: '', loser: '', score: [0, 0] };
        this.game.setGameLog(rematchLog);
        this.ui.launchGame();
    }
    destroy() {
        this.controllers.cleanup();
        this.renderer.destroy();
    }
}
