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
    showOnly(divId, displayStyle = "block") {
        const divIndex = [
            'select-game',
            'config-panel',
            'game-container',
            'game-results',
            'player2-login-panel'
        ];
        divIndex.forEach(id => {
            const checkDiv = document.getElementById(id);
            if (checkDiv)
                checkDiv.style.display = (id === divId) ? displayStyle : "none";
        });
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
        var _a, _b, _c, _d, _e;
        // Game mode buttons
        (_a = document.getElementById('play-1v1')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
            yield this.game.setPlayerInfo('player1', null);
            this.game.setGameMode('1v1');
            this.showOnly('player2-login-panel');
            this.setupPlayer2LoginPanel();
        }));
        (_b = document.getElementById('play-ai')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
            yield this.game.setPlayerInfo('player1', null);
            this.game.setGameMode('1vAI');
            this.showOnly('config-panel');
        }));
        (_c = document.getElementById('play-online')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
            // Lobby + diff player entry assignation
            // await this.game.setPlayerInfo('player1', null);
            this.game.setGameMode('remote');
            this.showOnly('config-panel');
        }));
        // Configuration panel elements
        this.setupConfigPanelListeners();
        // Start game button
        (_d = document.getElementById('start-game')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => {
            this.launchGame(this.game.log.mode);
        });
        // Back button - returns to lobby
        (_e = document.getElementById('back-button')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', () => {
            this.showOnly('select-game');
        });
    }
    /**
     * Set up listeners for the configuration panel elements
     */
    setupConfigPanelListeners() {
        // Score limit slider
        const scoreSlider = document.getElementById('score-limit');
        const scoreValue = document.getElementById('score-value');
        if (scoreSlider && scoreValue) {
            scoreSlider.addEventListener('input', () => {
                const value = scoreSlider.value;
                scoreValue.textContent = value;
                this.game.gameConfig.scoreLimit = parseInt(value);
            });
        }
        // Difficulty slider
        const difficultySlider = document.getElementById('difficulty');
        const difficultyValue = document.getElementById('difficulty-value');
        if (difficultySlider && difficultyValue) {
            difficultySlider.addEventListener('input', () => {
                const value = parseInt(difficultySlider.value);
                let difficultyText = 'Medium';
                let difficultyLevel = 'medium';
                if (value === 1) {
                    difficultyText = 'Easy';
                    difficultyLevel = 'easy';
                }
                else if (value === 3) {
                    difficultyText = 'Hard';
                    difficultyLevel = 'hard';
                }
                difficultyValue.textContent = difficultyText;
                this.game.gameConfig.difficulty = difficultyLevel;
            });
        }
    }
    setupPlayer2LoginPanel() {
        const loginPanel = document.getElementById('player2-login-panel');
        const configPanel = document.getElementById('config-panel');
        const loginForm = document.getElementById('player2-login-form');
        const guestBtn = document.getElementById('player2-guest-btn');
        const errorMsg = document.getElementById('player2-login-error');
        if (!loginPanel || !loginForm || !guestBtn || !configPanel)
            return;
        // Handle registered user login
        loginForm.onsubmit = (e) => __awaiter(this, void 0, void 0, function* () {
            e.preventDefault();
            const email = document.getElementById('player2-email').value;
            const password = document.getElementById('player2-password').value;
            const success = yield this.game.connection.checkPlayer({ email, password });
            if (!email || !password) {
                if (errorMsg)
                    errorMsg.textContent = 'Please enter both email and password';
                return;
            }
            if (success) {
                this.game.setPlayerInfo('player2', { email, password });
                this.showOnly('config-panel');
                if (errorMsg)
                    errorMsg.textContent = '';
            }
            else if (errorMsg)
                errorMsg.textContent = 'Invalid email or password. Please try again';
        });
        // Handle guest
        guestBtn.onclick = () => {
            const guestUser = {
                id: `guest-${Date.now()}`,
                username: 'Guest',
                tournamentUsername: 'Guest',
                email: 'guest@example.com',
                avatarPath: '/images/default-avatar.png'
            };
            this.game.setTempPlayerInfo('player2', guestUser);
            this.showOnly('config-panel');
            if (errorMsg)
                errorMsg.textContent = '';
        };
    }
    launchGame(mode, tournamentId) {
        if (!this.game.connection.socket || !this.game.connection.connectionStat) {
            console.error("Cannot join game: connection not ready");
            return;
        }
        this.game.setGameConfig(this.game.gameConfig);
        this.controllers.setupControllers(mode);
        this.game.connection.joinGame(mode, tournamentId);
        this.showOnly('game-container');
        this.game.renderer.canvas = document.getElementById('game-canvas');
        if (this.game.renderer.canvas)
            this.game.renderer.ctx = this.game.renderer.canvas.getContext('2d');
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
        this.showOnly('game-results', 'flex');
        // Add event listeners for the buttons (these need to be set each time)
        (_c = document.getElementById('play-again-btn')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => {
            this.showOnly('game-container');
            this.rematchGame();
        });
        (_d = document.getElementById('return-lobby-btn')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => {
            this.showOnly('select-game');
        });
    }
    /**
     * Reset the game to start a new one
     */
    rematchGame() {
        this.game.log.startTime = 0;
        this.game.log.duration = 0;
        this.game.log.result = { winner: '', loser: '', score: [0, 0] };
        this.game.renderer.isGameActive = true;
        this.launchGame(this.game.log.mode, this.game.log.tournamentId);
    }
}
