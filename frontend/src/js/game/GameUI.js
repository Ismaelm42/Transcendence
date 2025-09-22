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
    showOnly(divId, displayStyle = "block") {
        console.warn("showOnly div = ", divId);
        const divIndex = [
            'initial-screen',
            'config-panel',
            'game-results',
            'player2-login-panel',
            'ready-modal',
            'countdown-overlay',
            'pause-modal'
        ];
        if (divId === "hide_all") {
            divIndex.forEach(id => {
                const checkDiv = document.getElementById(id);
                if (checkDiv)
                    checkDiv.style.display = "none";
            });
            return;
        }
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
            this.setupEventListeners();
            this.requestGamesList();
        });
    }
    // Sets up event listeners for game mode buttons, which after will also set controllers
    setupEventListeners() {
        var _a, _b, _c, _d, _e, _f, _g;
        // Game mode buttons
        (_a = document.getElementById('play-1v1')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
            yield this.game.setPlayerInfo('player1', null);
            this.game.setGameMode('1v1');
            this.showOnly('player2-login-panel');
            this.setupPlayer2LoginPanel();
        }));
        (_b = document.getElementById('play-ai')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
            yield this.game.setPlayerInfo('player1', null);
            this.game.setGuestInfo('player2', 'ai');
            this.game.setGameMode('1vAI');
            this.showOnly('config-panel');
        }));
        (_c = document.getElementById('play-online')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
            yield this.game.setPlayerInfo('player1', null);
            this.game.setGameMode('remote');
            this.showOnly('config-panel');
        }));
        // Configuration panel elements
        this.setupConfigPanelListeners();
        // Start game button
        (_d = document.getElementById('start-game')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => {
            this.launchGame();
        });
        // Back button - returns to lobby
        (_e = document.getElementById('back-button')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', () => {
            this.showOnly('initial-screen', 'flex');
        });
        // Back button on 2nd player selection panel
        (_f = document.getElementById('player2-back-btn')) === null || _f === void 0 ? void 0 : _f.addEventListener('click', () => {
            this.showOnly('initial-screen', 'flex');
        });
        // Refresh lobby button
        (_g = document.getElementById('refresh-lobby-btn')) === null || _g === void 0 ? void 0 : _g.addEventListener('click', () => {
            this.requestGamesList();
        });
    }
    requestGamesList() {
        const connection = this.game.getGameConnection();
        if (connection.socket && connection.connectionStat)
            connection.socket.send(JSON.stringify({ type: 'SHOW_GAMES' }));
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
                if (Number(value) < 4) {
                    scoreValue.classList.remove('text-supernova-400', 'text-international-orange-400', 'text-international-orange-600');
                    scoreValue.classList.add('text-supernova-400');
                }
                else if (Number(value) > 4 && Number(value) < 8) {
                    scoreValue.classList.remove('text-supernova-400', 'text-international-orange-400', 'text-international-orange-600');
                    scoreValue.classList.add('text-international-orange-400');
                }
                else {
                    scoreValue.classList.remove('text-supernova-400', 'text-international-orange-400', 'text-international-orange-600');
                    scoreValue.classList.add('text-international-orange-600');
                }
                scoreValue.textContent = value;
                this.game.getGameConfig().scoreLimit = parseInt(value);
            });
        }
        // Difficulty slider
        const difficultySlider = document.getElementById('difficulty');
        const difficultyValue = document.getElementById('difficulty-value');
        if (difficultySlider && difficultyValue) {
            difficultySlider.addEventListener('input', () => {
                const value = parseInt(difficultySlider.value);
                let difficultyText = 'Medium';
                difficultyValue.classList.remove('text-supernova-400', 'text-international-orange-400', 'text-international-orange-600');
                difficultyValue.classList.add('text-international-orange-400');
                let difficultyLevel = 'medium';
                if (value === 1) {
                    difficultyText = 'Easy';
                    difficultyLevel = 'easy';
                    difficultyValue.classList.remove('text-supernova-400', 'text-international-orange-600', 'text-international-orange-400');
                    difficultyValue.classList.add('text-supernova-400');
                }
                else if (value === 3) {
                    difficultyText = 'Hard';
                    difficultyLevel = 'hard';
                    difficultyValue.classList.remove('text-supernova-400', 'text-international-orange-600', 'text-international-orange-400');
                    difficultyValue.classList.add('text-international-orange-600');
                }
                difficultyValue.textContent = difficultyText;
                this.game.getGameConfig().difficulty = difficultyLevel;
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
            const success = yield this.game.getGameConnection().checkPlayer({ email, password });
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
            this.game.setGuestInfo('player2', 'guest');
            this.showOnly('config-panel');
            if (errorMsg)
                errorMsg.textContent = '';
        };
    }
    launchGame() {
        if (!this.game.getGameConnection().socket || !this.game.getGameConnection().connectionStat) {
            console.error("Cannot join game: connection not ready");
            return;
        }
        this.game.setGameConfig(this.game.getGameConfig());
        this.game.getGameConnection().joinGame();
    }
    updateLobby(games) {
        const lobbyDiv = document.getElementById('lobby-games-list');
        if (!lobbyDiv)
            return;
        lobbyDiv.innerHTML = '';
        if (!games || games.length === 0) {
            lobbyDiv.innerHTML = '<div class="text-white text-center">No games available.</div>';
            return;
        }
        // Per each game returned by backend, we create a new game card and append it to lobbyDiv
        // TODO: we can add more elements to the card as "Ready, Full, In progress"...
        console.log("GameDATA from server games", games);
        games.forEach((game) => {
            var _a, _b, _c;
            const card = document.createElement('div');
            card.className = 'bg-gray-700 rounded p-4 flex flex-col gap-2';
            card.innerHTML = `
				<div class="text-white font-bold">Game ID: ${game.id}</div>
				<div class="text-gray-300">Host: ${(_a = game.playerDetails.player1) === null || _a === void 0 ? void 0 : _a.username}</div>
				<div class="text-gray-300">Limit score: ${(_b = game.config) === null || _b === void 0 ? void 0 : _b.scoreLimit}</div>
				<div class="text-gray-300">Difficulty: ${(_c = game.config) === null || _c === void 0 ? void 0 : _c.difficulty}</div>
				<button class="join-game-btn bg-green-500 text-white rounded px-3 py-2 mt-2" data-gameid="${game.id}">Join</button>
			`;
            lobbyDiv.appendChild(card);
        });
        // Join game button - copy the game.lod metadata and uses to call JOIN API endpoint (should work)
        // TODO: protect errors like game full or maybe only allow click event when 100% sure is the right moment
        lobbyDiv.querySelectorAll('.join-game-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const gameId = e.target.getAttribute('data-gameid');
                if (gameId) {
                    this.game.setGameIsHost(false);
                    this.game.getGameConnection().joinGame(gameId);
                }
            });
        });
    }
}
