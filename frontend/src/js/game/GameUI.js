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
        this.selectedGameMode = '';
        this.game = game;
        this.controllers = new GameControllers(game);
    }
    showOnly(divId) {
        const divIndex = [
            'select-game',
            'config-panel',
            'game-canvas',
            'game-results-overlay'
        ];
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
        var _a, _b, _c, _d, _e, _f;
        // Game mode buttons
        (_a = document.getElementById('play-ai')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
            this.selectedGameMode = '1vAI';
            this.showConfigPanel('AI Game');
            this.controllers.setupControllers('1vAI');
        });
        (_b = document.getElementById('play-1v1')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
            this.selectedGameMode = '1v1';
            this.showConfigPanel('Local 1v1');
            this.controllers.setupControllers('1v1');
        });
        (_c = document.getElementById('play-online')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => {
            this.selectedGameMode = 'remote';
            this.showConfigPanel('Online Game');
            this.controllers.setupControllers('remote');
        });
        (_d = document.getElementById('play-tournament')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => {
            this.selectedGameMode = 'tournament';
            this.showConfigPanel('Tournament Game');
            this.controllers.setupControllers('tournament');
        });
        // Configuration panel elements
        this.setupConfigPanelListeners();
        // Start game button
        (_e = document.getElementById('start-game')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', () => {
            this.launchGame(this.selectedGameMode);
        });
        // Back button - returns to lobby
        (_f = document.getElementById('back-button')) === null || _f === void 0 ? void 0 : _f.addEventListener('click', () => {
            window.location.reload();
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
    /**
     * Set up and show the game configuration panel
     * @param modeTitle The title to display in the configuration panel
     */
    showConfigPanel(modeTitle) {
        const configPanel = document.getElementById('config-panel');
        const configTitle = document.getElementById('config-title');
        const selectGameDiv = document.getElementById('select-game');
        if (selectGameDiv)
            selectGameDiv.style.display = 'none';
        if (configTitle)
            configTitle.textContent = `Select configuration for ${modeTitle}`;
        if (configPanel)
            configPanel.style.display = 'block';
    }
    launchGame(mode, tournamentId) {
        if (!this.game.connection.socket || !this.game.connection.connectionStat) {
            console.error("Cannot join game: connection not ready");
            return;
        }
        this.game.setGameConfig(this.game.gameConfig);
        this.controllers.setupControllers(mode);
        this.game.connection.joinGame(mode, tournamentId);
        const selectGame = document.getElementById('select-game');
        if (selectGame)
            selectGame.style.display = "none";
        const gameDiv = document.getElementById('game-container');
        if (gameDiv)
            gameDiv.style.display = "block";
        const configPanel = document.getElementById('config-panel');
        if (configPanel)
            configPanel.style.display = "none";
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
        console.log("Showing game results:", gameData);
        // Get the game results overlay element
        const resultsContainer = document.getElementById('game-results');
        if (!resultsContainer) {
            console.error("Game results container not found!");
            return;
        }
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
        resultsContainer.style.display = "flex";
        // Add event listeners for the buttons (these need to be set each time)
        (_c = document.getElementById('play-again-btn')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => {
            if (resultsContainer)
                resultsContainer.style.display = "none";
            this.rematchGame();
        });
        (_d = document.getElementById('return-lobby-btn')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => {
            if (resultsContainer)
                resultsContainer.style.display = "none";
            window.location.reload();
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
