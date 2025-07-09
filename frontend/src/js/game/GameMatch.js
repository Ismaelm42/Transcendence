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
import { GameAI } from './GameAI.js';
export default class GameMatch extends Step {
    constructor(game) {
        super('game-container');
        this.ai = null;
        this.readyStateInterval = null;
        this.game = game;
        this.renderer = game.getGameRender();
        this.controllers = new GameControllers(this.game);
        this.config = game.getGameConfig();
        this.log = game.getGameLog();
        this.ui = game.getGameUI();
        this.connection = game.getGameConnection();
        if (this.log.mode === '1vAI')
            this.ai = new GameAI(this.game);
    }
    render(appElement) {
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
            const canvas = document.getElementById('game-canvas');
            if (canvas) {
                this.renderer.canvas = canvas;
                this.renderer.ctx = canvas.getContext('2d');
            }
            this.showReadyModal();
            const pauseModal = document.getElementById('pause-modal');
            const pauseBtn = document.getElementById('pause-btn');
            if (pauseModal && pauseBtn) {
                pauseBtn.onclick = () => {
                    var _a, _b;
                    if (this.log.mode === 'remote') {
                        (_a = this.connection.socket) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify({
                            type: 'PAUSE_GAME',
                        }));
                    }
                    else {
                        (_b = this.connection.socket) === null || _b === void 0 ? void 0 : _b.send(JSON.stringify({
                            type: 'PAUSE_GAME',
                            reason: "A player has paused the game"
                        }));
                    }
                };
            }
            const resumeBtn = document.getElementById('resume-btn');
            if (pauseModal && resumeBtn) {
                resumeBtn.onclick = () => {
                    var _a;
                    (_a = this.connection.socket) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify({ type: 'RESUME_GAME' }));
                };
            }
        });
    }
    /**
     * Display player waiting/ready status modal when game created
     */
    showReadyModal() {
        const readyModal = document.getElementById('ready-modal');
        const readyBtn = document.getElementById('ready-btn');
        const waitingMsg = document.getElementById('waiting-msg');
        const player1 = this.log.playerDetails.player1;
        const player2 = this.log.playerDetails.player2;
        document.getElementById('player1-name').textContent = (player1 === null || player1 === void 0 ? void 0 : player1.username) || "Waiting player 1...";
        document.getElementById('player1-avatar').src = (player1 === null || player1 === void 0 ? void 0 : player1.avatarPath) || "https://localhost:8443/back/images/7.png";
        document.getElementById('player2-name').textContent = (player2 === null || player2 === void 0 ? void 0 : player2.username) || "Waiting player 2...";
        document.getElementById('player2-avatar').src = (player2 === null || player2 === void 0 ? void 0 : player2.avatarPath) || "https://localhost:8443/back/images/7.png";
        if (readyBtn && waitingMsg) {
            readyBtn.onclick = () => {
                var _a;
                readyBtn.disabled = true;
                waitingMsg.textContent = "Waiting for opponent confirmation...";
                (_a = this.connection.socket) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify({ type: 'CLIENT_READY' }));
                if (this.ai)
                    this.ai.start();
                this.controllers.setupControllers();
            };
        }
        if (this.log.mode === 'remote' && readyModal)
            this.startReadyStatePolling();
    }
    showPauseModal(reason, pauserId) {
        console.warn("pauserID", pauserId);
        const pauseModal = document.getElementById('pause-modal');
        const pauseReason = document.getElementById('pause-reason');
        const resumeBtn = document.getElementById('resume-btn');
        if (pauseModal)
            pauseModal.style.display = 'flex';
        if (pauseReason)
            pauseReason.textContent = reason || '';
        if (this.log.mode === 'remote' && resumeBtn && pauserId) {
            console.warn("onlineid = ", this.game.getOnlineId());
            console.warn("pauserId = ", pauserId);
            resumeBtn.style.display = (this.game.getOnlineId() === pauserId) ? 'inline-block' : 'none';
        }
    }
    hidePauseModal() {
        const pauseModal = document.getElementById('pause-modal');
        if (pauseModal)
            pauseModal.style.display = 'none';
    }
    /**
     * Display game results when a game ends
     * @param gameData Complete game data
     */
    showGameResults(gameData) {
        var _a, _b, _c;
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
        const playAgainBtn = document.getElementById('play-again-btn');
        if (playAgainBtn && (gameData.tournamentId || gameData.mode === 'remote'))
            playAgainBtn.hidden = true;
        else if (playAgainBtn)
            playAgainBtn.hidden = false;
        // Show the results overlay
        this.ui.showOnly('game-results', 'flex');
        // Add event listeners for the buttons (these need to be set each time)
        playAgainBtn === null || playAgainBtn === void 0 ? void 0 : playAgainBtn.addEventListener('click', () => {
            this.ui.showOnly('game-container');
            this.rematchGame(true);
        });
        (_c = document.getElementById('return-lobby-btn')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => {
            this.rematchGame(false);
            this.controllers.cleanup();
            this.controllers.destroy();
            this.destroy();
            const spa = SPA.getInstance();
            spa.currentGame = null;
            spa.navigate(this.log.tournamentId ? 'test' : 'game-lobby');
            // TODO: change SPA route 'test' for 'tournament' when ready
        });
    }
    /**
     * Reset the game to start a new one
     */
    rematchGame(state) {
        if (this.connection.socket) {
            this.connection.socket.send(JSON.stringify({
                type: 'RESTART_GAME',
                rematch: state
            }));
        }
    }
    startReadyStatePolling() {
        if (this.readyStateInterval)
            return;
        this.readyStateInterval = window.setInterval(() => {
            var _a;
            (_a = this.connection.socket) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify({ type: 'GET_READY_STATE' }));
        }, 1000);
    }
    stopReadyStatePolling() {
        if (this.readyStateInterval) {
            clearInterval(this.readyStateInterval);
            this.readyStateInterval = null;
        }
    }
    updateReadyModal(playerDetails, readyStates) {
        var _a, _b, _c, _d;
        const player1Name = document.getElementById('player1-name');
        const player1Avatar = document.getElementById('player1-avatar');
        const player2Name = document.getElementById('player2-name');
        const player2Avatar = document.getElementById('player2-avatar');
        const player1Ready = document.getElementById('player1-ready');
        const player2Ready = document.getElementById('player2-ready');
        player1Name.textContent = ((_a = playerDetails.player1) === null || _a === void 0 ? void 0 : _a.username) || "Waiting player 1...";
        player1Avatar.src = ((_b = playerDetails.player1) === null || _b === void 0 ? void 0 : _b.avatarPath) || "https://localhost:8443/back/images/7.png";
        player2Name.textContent = ((_c = playerDetails.player2) === null || _c === void 0 ? void 0 : _c.username) || "Waiting player 2...";
        player2Avatar.src = ((_d = playerDetails.player2) === null || _d === void 0 ? void 0 : _d.avatarPath) || "https://localhost:8443/back/images/7.png";
        player1Ready.textContent = readyStates.player1 ? "Ready" : "";
        player2Ready.textContent = readyStates.player2 ? "Ready" : "";
    }
    showCountdown(seconds = 3) {
        const overlay = document.getElementById('countdown-overlay');
        const number = document.getElementById('countdown-number');
        if (!overlay || !number)
            return;
        overlay.style.display = 'flex';
        let count = seconds;
        number.textContent = count.toString();
        const interval = setInterval(() => {
            count--;
            if (count > 0)
                number.textContent = count.toString();
            else {
                number.textContent = "GO!";
                setTimeout(() => {
                    overlay.style.display = 'none';
                }, 800);
                clearInterval(interval);
            }
        }, 1000);
    }
    destroy() {
        this.controllers.cleanup();
        this.renderer.destroy();
        if (this.ai) {
            this.ai.stop();
            this.ai = null;
        }
    }
}
