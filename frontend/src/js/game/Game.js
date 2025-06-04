/**
 * Game.ts -> main class file with core functionalities and get/setters
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
import { GameConnection } from './GameConnection.js';
import { GameRender } from './GameRender.js';
import { GameUI } from './GameUI.js';
import { Step } from "../spa/stepRender.js";
// Default container ID (must match your HTML)
const DEFAULT_CONTAINER_ID = "game-container";
export default class Game extends Step {
    constructor(containerId = DEFAULT_CONTAINER_ID) {
        super(containerId);
        this.gameConfig = { scoreLimit: 5, difficulty: 'medium' };
        console.log("Game constructor called");
        this.connection = new GameConnection(this);
        this.renderer = new GameRender(this);
        this.ui = new GameUI(this);
        this.log = {
            id: "game " + Date.now(),
            mode: '',
            player1: null,
            player2: null,
            startTime: 0,
            config: undefined,
            result: { winner: '', loser: '', score: [0, 0] },
            duration: 0,
            tournamentId: null,
            readyState: false
        };
    }
    render(appElement) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ui.initializeUI(appElement);
            yield this.connection.establishConnection();
            this.ui.setupEventListeners();
        });
    }
    /**
     * Set game mode (1vAI, 1v1, remote)
     * @param mode Game mode
     */
    setGameMode(mode) {
        this.log.mode = mode;
    }
    /**
     * Set game configuration options
     * @param config Game configuration object
     */
    setGameConfig(config) {
        this.log.config = config;
        console.log(`Game configuration set: Score limit=${config.scoreLimit}, Difficulty=${config.difficulty}`);
    }
    /**
     * Set player information
     * @param playerKey 'player1' or 'player2'
     * @param playerData Player data object
     */
    setPlayerInfo(playerKey_1) {
        return __awaiter(this, arguments, void 0, function* (playerKey, data = null) {
            const user = yield this.connection.parseUserInfo(data);
            this.log[playerKey] = user;
        });
    }
    setTempPlayerInfo(playerKey, playerData) {
        this.log[playerKey] = playerData;
    }
    /**
     * Set tournament ID if this game is part of a tournament
     * @param id Tournament ID
     */
    setTournamentId(id) {
        this.log.tournamentId = id;
    }
    /**
     * Start tracking game session
     */
    startGameSession() {
        this.log.startTime = Date.now();
        console.log(`Starting game session. Mode: ${this.log.mode}`);
    }
    /**
     * Handle game end - record final data
     * @param result Result data from server
     */
    endGameSession(result) {
        this.log.duration = Date.now() - this.log.startTime;
        this.log.result = result;
        console.log("Game session ended:", this.log);
        this.renderer.stopRenderLoop();
        this.ui.controllers.cleanup();
    }
    /**
     * Get complete game log data
     * @returns GameData object
     */
    getGameLog() {
        return (this.log);
    }
    destroy() {
        this.connection.destroy();
        this.renderer.destroy();
    }
}
