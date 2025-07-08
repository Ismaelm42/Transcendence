var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Some functions that could be useful if imported:
// import {checkPlayer, parsePlayerInfo} from '../game/GameConnection.js' - not sure if working fine without sockets
// import { setPlayerInfo, setGuestInfo } from '../game/Game.js'; - not usables, but could adapt to work outside the object instance
import Game from '../game/Game.js';
import { SPA } from '../spa/spa.js';
import { Step } from "../spa/stepRender.js";
import { fetchRandomAvatarPath } from '../game/utils.js';
// Default container ID (I think it must match HTML file)
const DEFAULT_CONTAINER_ID = "tournament-container";
export default class Tournament extends Step {
    constructor(containerId = DEFAULT_CONTAINER_ID) {
        super(DEFAULT_CONTAINER_ID);
        // TODO: currentMatchIndex needs to be stored on session and updated each time tournament step is rendered
        this.currentMatchIndex = 0;
        this.game = new Game(DEFAULT_CONTAINER_ID, "tournament-game");
        this.bracket = [];
        this.config = null;
        this.players = null;
    }
    render(appElement) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch("../../html/game/tournamentUI.html");
                if (!response.ok)
                    throw new Error("Failed to load the game UI HTML file");
                const htmlContent = yield response.text();
                appElement.innerHTML = htmlContent;
            }
            catch (error) {
                console.error("Error loading game UI:", error);
                appElement.innerHTML = `<div class="error-container">Failed to load game interface. Please try again.</div>`;
            }
            // Generate test simple bracket with default values hardcoded
            this.generateTestBracket(4);
            // Create one Game instance for the whole tournament
            const spa = SPA.getInstance();
            spa.currentGame = this.game;
            yield this.game.getGameConnection().establishConnection();
            const launchBtn = document.getElementById('launch-match-btn');
            if (launchBtn)
                launchBtn.addEventListener('click', () => this.launchNextMatch());
            this.displayCurrentMatch();
        });
    }
    displayCurrentMatch() {
        var _a, _b, _c, _d, _e, _f;
        const panel = document.getElementById('current-match-panel');
        if (!panel || !this.bracket)
            return;
        const match = this.bracket[this.currentMatchIndex];
        if (!match) {
            panel.innerHTML = "<p>No more matches.</p>";
            return;
        }
        panel.innerHTML = `
		<div class="bg-gray-800 border-2 border-[#00ff99] rounded-xl shadow-lg p-6 max-w-md mx-auto my-8 text-white">
			<h3 class="text-[#00ff99] text-xl font-bold mb-4 text-center tracking-wide">Current Match</h3>
			<div class="flex items-center justify-center gap-8 mb-4">
				<div class="flex flex-col items-center">
					<img src="${((_a = match.playerDetails.player1) === null || _a === void 0 ? void 0 : _a.avatarPath) || '/images/default-avatar.png'}" alt="Avatar" class="w-14 h-14 rounded-full border-2 border-[#00ff99] mb-2">
					<span class="font-semibold">${(_b = match.playerDetails.player1) === null || _b === void 0 ? void 0 : _b.username}</span>
				</div>
				<span class="text-2xl font-bold text-[#00ff99]">VS</span>
				<div class="flex flex-col items-center">
					<img src="${((_c = match.playerDetails.player2) === null || _c === void 0 ? void 0 : _c.avatarPath) || '/images/default-avatar.png'}" alt="Avatar" class="w-14 h-14 rounded-full border-2 border-[#00ff99] mb-2">
					<span class="font-semibold">${(_d = match.playerDetails.player2) === null || _d === void 0 ? void 0 : _d.username}</span>
				</div>
			</div>
			<div class="flex justify-between text-sm text-gray-300 mb-2">
				<span>Match ID:</span>
				<span class="font-medium text-white">${match.id}</span>
			</div>
			<div class="flex justify-between text-sm text-gray-300">
				<span>Score Limit:</span>
				<span class="font-medium text-white">${(_e = match.config) === null || _e === void 0 ? void 0 : _e.scoreLimit}</span>
				<span class="ml-4">Difficulty:</span>
				<span class="font-medium text-white">${(_f = match.config) === null || _f === void 0 ? void 0 : _f.difficulty}</span>
			</div>
		</div>
	`;
    }
    // Matchmaking first (or random) and then fill each game.log (metadata) of the array
    generateTestBracket(count) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.bracket)
                this.bracket = [];
            for (let i = 0; i < count; i++) {
                const avatarPlayer1 = yield fetchRandomAvatarPath();
                const avatarPlayer2 = yield fetchRandomAvatarPath();
                const matchData = {
                    id: `test-match-${i + 1}`,
                    mode: '1v1',
                    playerDetails: {
                        player1: {
                            id: 40 + (i * 2 + 1),
                            username: `Player${i * 2 + 1}`,
                            tournamentUsername: `Player${i * 2 + 1}`,
                            email: `player${i * 2 + 1}@test.com`,
                            avatarPath: avatarPlayer1
                        },
                        player2: {
                            id: 40 + (i * 2 + 2),
                            username: `Player${i * 2 + 2}`,
                            tournamentUsername: `Player${i * 2 + 2}`,
                            email: `player${i * 2 + 2}@test.com`,
                            avatarPath: avatarPlayer2
                        }
                    },
                    startTime: Date.now(),
                    config: {
                        scoreLimit: 2,
                        difficulty: 'medium'
                    },
                    result: {
                        winner: '',
                        loser: '',
                        score: [0, 0]
                    },
                    duration: 0,
                    tournamentId: 1,
                    readyState: true
                };
                this.bracket.push(matchData);
            }
        });
    }
    // "Recycle" game instance with current match data and launchGame, which will
    // start the game API workflow and go to match-render step
    launchNextMatch() {
        if (this.bracket && this.currentMatchIndex < this.bracket.length && this.game) {
            const matchData = this.bracket[this.currentMatchIndex];
            this.game.setGameLog(matchData);
            if (matchData.config)
                this.game.setGameConfig(matchData.config);
            const spa = SPA.getInstance();
            spa.currentGame = this.game;
            this.game.getGameUI().launchGame();
            this.currentMatchIndex++;
            this.displayCurrentMatch();
        }
    }
    // Receive and gather game results - may need to improve gameMatch class to pass this info
    // Also, may need to call it or implement it on a wait/promise manner?
    handleMatchResult(result) {
        // Aux method -> Update bracket, increment currentMatchIndex, etc.
    }
}
