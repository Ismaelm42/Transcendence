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
    constructor(game, tournament) {
        super('game-container');
        this.ai = null;
        this.aiSide = null;
        this.readyStateInterval = null;
        this.countdownInterval = null;
        this.pauseInterval = null;
        // Prevent page scrolling with ArrowUp/ArrowDown while on game-match
        this.preventScrollOnArrow = (e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                // Block the browser's default scroll but allow the event for game controllers
                e.preventDefault();
            }
        };
        this.game = game;
        this.tournament = tournament !== null && tournament !== void 0 ? tournament : null;
        this.renderer = game.getGameRender();
        this.config = game.getGameConfig();
        this.log = game.getGameLog();
        this.ui = game.getGameUI();
        this.connection = game.getGameConnection();
        if (this.log.mode === '1vAI') {
            this.setAiSide(this.game.getGameLog());
            this.ai = new GameAI(this.game, this.aiSide);
        }
        this.controllers = new GameControllers(this.game, this.aiSide);
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
            this.updatePlayerActivity(true);
            // Disable main page scrolling using ArrowUp/ArrowDown while this step is active
            window.addEventListener('keydown', this.preventScrollOnArrow, { passive: false });
            const canvas = document.getElementById('game-canvas');
            if (canvas) {
                this.renderer.canvas = canvas;
                this.renderer.ctx = canvas.getContext('2d');
                this.renderer.drawInitialState();
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
                    console.warn("resume-btn-clicked");
                    //pauseModal.style.display = 'none';
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
        /** search TournamentName  */
        /** to revert this change just delete everything but the code into the else */
        const players = { player1, player2 };
        if (this.tournament && this.tournament.getTournamentId() !== -42 && player1 && player2) {
            document.getElementById('player1-name').innerHTML = this.showTournamentName(players, player1 === null || player1 === void 0 ? void 0 : player1.username) || "Waiting <br>player 1...";
            document.getElementById('player2-name').innerHTML = this.showTournamentName(players, player2 === null || player2 === void 0 ? void 0 : player2.username) || "Waiting <br>player 2...";
            document.getElementById('player1-avatar').src = (player1 === null || player1 === void 0 ? void 0 : player1.avatarPath) || "https://localhost:8443/back/images/7.png";
            document.getElementById('player2-avatar').src = (player2 === null || player2 === void 0 ? void 0 : player2.avatarPath) || "https://localhost:8443/back/images/7.png";
        }
        else {
            document.getElementById('player1-name').innerHTML = (player1 === null || player1 === void 0 ? void 0 : player1.username) || "Waiting <br>player 1...";
            document.getElementById('player1-avatar').src = (player1 === null || player1 === void 0 ? void 0 : player1.avatarPath) || "https://localhost:8443/back/images/7.png";
            document.getElementById('player2-name').innerHTML = (player2 === null || player2 === void 0 ? void 0 : player2.username) || "Waiting <br>player 2...";
            document.getElementById('player2-avatar').src = (player2 === null || player2 === void 0 ? void 0 : player2.avatarPath) || "https://localhost:8443/back/images/7.png";
        }
        /*  end of search */
        if (readyBtn && waitingMsg) {
            readyBtn.onclick = () => {
                var _a;
                readyBtn.disabled = true;
                waitingMsg.innerHTML = `Waiting for<br>opponent confirmation...`;
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
        const confirmModal = document.getElementById('confirm-dialog-overlay');
        if (confirmModal && confirmModal.style.display != "none")
            return;
        const pauseModal = document.getElementById('pause-modal');
        const pauseReason = document.getElementById('pause-reason');
        const resumeBtn = document.getElementById('resume-btn');
        if (pauseModal)
            pauseModal.style.display = 'flex';
        if (pauseReason)
            pauseReason.textContent = reason || '';
        if (this.log.mode === 'remote' && resumeBtn && pauserId) {
            resumeBtn.style.display = (this.game.getOnlineId() === pauserId) ? 'inline-block' : 'none';
        }
        const timerEl = document.getElementById('pause-timer');
        const barEl = document.getElementById('pause-timer-bar');
        const duration = this.game.pauseDuration;
        if (!timerEl || !barEl || !duration)
            return;
        if (this.pauseInterval) {
            clearInterval(this.pauseInterval);
            this.pauseInterval = null;
        }
        let remaining = duration;
        const render = () => {
            if (remaining <= 0) {
                timerEl.textContent = '00:00';
                if (barEl)
                    barEl.style.width = '0%';
                clearInterval(this.pauseInterval);
                this.pauseInterval = null;
                return;
            }
            const secs = Math.ceil(remaining / 1000);
            const mm = String(Math.floor(secs / 60)).padStart(2, '0');
            const ss = String(secs % 60).padStart(2, '0');
            timerEl.textContent = `${mm}:${ss}`;
            if (barEl) {
                const pct = (remaining / duration) * 100;
                barEl.style.width = pct.toFixed(2) + '%';
            }
        };
        render();
        this.pauseInterval = window.setInterval(() => {
            remaining -= 500;
            render();
        }, 500);
    }
    hidePauseModal() {
        const pauseModal = document.getElementById('pause-modal');
        if (pauseModal)
            pauseModal.style.display = 'none';
    }
    /**
     *
     * @param players pair of players
     * @param username username to find
     * @returns tournamentUsername
     */
    showTournamentName(players, username) {
        if (this.tournament && this.tournament.getTournamentId() !== -42) {
            const player = [players.player1, players.player2].find((p) => (p === null || p === void 0 ? void 0 : p.username) === username);
            if (player && player.tournamentUsername) {
                return player.tournamentUsername;
            }
        }
        return "";
    }
    /**
     * Display game results when a game ends
     * @param gameData Complete game data
     */
    showGameResults(gameData) {
        var _a, _b, _c, _d, _e, _f;
        // Update the HTML content with actual game data logs
        const winnerElement = document.getElementById('winner-name');
        const scoreElement = document.getElementById('final-score');
        const durationElement = document.getElementById('game-duration');
        if (winnerElement)
            winnerElement.textContent = ((_a = gameData.result) === null || _a === void 0 ? void 0 : _a.winner) || 'Unknown';
        // Search for tournamentName if on tournamentMatch
        if (this.tournament && this.tournament.getTournamentId() !== -42 && winnerElement && ((_b = gameData.result) === null || _b === void 0 ? void 0 : _b.winner)) {
            const winnerUsername = (_c = gameData.result) === null || _c === void 0 ? void 0 : _c.winner;
            const players = gameData.playerDetails;
            const tournamentName = this.showTournamentName(players, winnerUsername);
            if (tournamentName)
                winnerElement.textContent = tournamentName;
        }
        if (scoreElement) {
            const score = ((_d = gameData.result) === null || _d === void 0 ? void 0 : _d.score) || [0, 0];
            scoreElement.textContent = `${score[0]} - ${score[1]}`;
        }
        if (durationElement) {
            const duration = gameData.duration ? Math.floor(gameData.duration / 1000) : 0;
            durationElement.textContent = duration.toString();
        }
        const reasonElement = document.getElementById('end-reason');
        if (reasonElement)
            reasonElement.textContent = ((_e = gameData.result) === null || _e === void 0 ? void 0 : _e.endReason) || 'Game ended';
        const playAgainBtn = document.getElementById('play-again-btn');
        if (playAgainBtn && (gameData.tournamentId || gameData.mode === 'remote'))
            playAgainBtn.hidden = true;
        else if (playAgainBtn)
            playAgainBtn.hidden = false;
        const returnLobbyBtn = document.getElementById('return-lobby-btn');
        if (returnLobbyBtn) {
            if (gameData.tournamentId && gameData.tournamentId !== -42)
                returnLobbyBtn.textContent = "Return to Tournament";
            else
                returnLobbyBtn.textContent = "Return to Lobby";
        }
        // Show the results overlay
        this.ui.showOnly('game-results', 'flex');
        // Add event listeners for the buttons (these need to be set each time)
        playAgainBtn === null || playAgainBtn === void 0 ? void 0 : playAgainBtn.addEventListener('click', () => {
            this.ui.showOnly('hide-all');
            this.rematchGame(true);
        });
        (_f = document.getElementById('return-lobby-btn')) === null || _f === void 0 ? void 0 : _f.addEventListener('click', () => {
            this.rematchGame(false);
            this.controllers.cleanup();
            this.controllers.destroy();
            this.destroy();
            const spa = SPA.getInstance();
            if (this.tournament && this.tournament.getTournamentId() !== -42) {
                console.log("FROM showGameResults, Handling match result for tournament:", this.tournament.getTournamentId());
                console.log("Match result data:", gameData);
                this.tournament.resumeTournament();
                this.tournament.handleMatchResult(gameData);
            }
            else {
                spa.currentGame = null;
                spa.navigate('game-lobby');
            }
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
        player1Name.innerHTML = ((_a = playerDetails.player1) === null || _a === void 0 ? void 0 : _a.username) || "Waiting <br>player 1...";
        player1Avatar.src = ((_b = playerDetails.player1) === null || _b === void 0 ? void 0 : _b.avatarPath) || "https://localhost:8443/back/images/7.png";
        player2Name.innerHTML = ((_c = playerDetails.player2) === null || _c === void 0 ? void 0 : _c.username) || "Waiting <br>player 2...";
        player2Avatar.src = ((_d = playerDetails.player2) === null || _d === void 0 ? void 0 : _d.avatarPath) || "https://localhost:8443/back/images/7.png";
        player1Ready.textContent = readyStates.player1 ? "Ready" : "Press Ready...";
        if (player1Ready.textContent === "Ready")
            player1Ready.classList.remove("blink");
        player2Ready.textContent = readyStates.player2 ? "Ready" : "";
    }
    showCountdown(seconds = 3, reason) {
        const overlay = document.getElementById('countdown-overlay');
        const number = document.getElementById('countdown-number');
        const reasonElem = document.getElementById('countdown-reason');
        if (!overlay || !number)
            return;
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        let count = seconds;
        overlay.style.display = 'flex';
        number.textContent = count.toString();
        if (reasonElem)
            reasonElem.textContent = reason || '';
        this.countdownInterval = window.setInterval(() => {
            count--;
            if (count > 0)
                number.textContent = count.toString();
            else if (count == 0) {
                number.textContent = "GO!";
                clearInterval(this.countdownInterval);
                this.countdownInterval = null;
                setTimeout(() => {
                    overlay.style.display = 'none';
                }, 400);
            }
        }, 1000);
    }
    updatePlayerActivity(state) {
        var _a;
        (_a = this.connection.socket) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify({
            type: 'GAME_ACTIVITY',
            active: state
        }));
    }
    setAiSide(gamelog) {
        var _a;
        const player1Id = (_a = gamelog.playerDetails.player1) === null || _a === void 0 ? void 0 : _a.id;
        if (player1Id !== undefined && player1Id <= -1 && player1Id >= -19)
            this.aiSide = 'player1';
        else
            this.aiSide = 'player2';
    }
    getAiSide() {
        return (this.aiSide);
    }
    destroy() {
        console.warn("GameMatch Destructor Called(!)");
        this.updatePlayerActivity(false);
        // Re-enable normal page behavior
        window.removeEventListener('keydown', this.preventScrollOnArrow);
        this.controllers.cleanup();
        this.renderer.destroy();
        if (this.ai) {
            this.ai.stop();
            this.ai = null;
        }
        // Not sure if needed or if can cause conflict - let's test it for a while...
        if (this.readyStateInterval) {
            clearInterval(this.readyStateInterval);
            this.readyStateInterval = null;
        }
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
    }
}
