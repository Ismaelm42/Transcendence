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
import { Step } from '../spa/stepRender.js';
import { fetchRandomAvatarPath } from './utils.js';
// Default container ID (I think i should match HTML file)
const DEFAULT_CONTAINER_ID = "game-container";
export default class Game extends Step {
    /***************************************/
    /*********** CONSTRUCTOR ***************/
    constructor(containerId = DEFAULT_CONTAINER_ID, id) {
        super(containerId);
        this.gameConfig = { scoreLimit: 5, difficulty: 'medium' };
        this.match = null;
        this.onlineId = null;
        if (id)
            this.gameId = id;
        else
            this.gameId = "game-" + Date.now().toString(36);
        this.connection = new GameConnection(this);
        this.renderer = new GameRender(this);
        this.ui = new GameUI(this);
        this.log = {
            id: this.gameId,
            mode: '',
            playerDetails: { player1: null, player2: null },
            startTime: 0,
            config: { scoreLimit: 5, difficulty: 'medium' },
            result: { winner: '', loser: '', score: [0, 0] },
            duration: 0,
            tournamentId: null,
            readyState: false
        };
        this.isHost = true;
    }
    /************ CORE *****************/
    /*********** METHODS ***************/
    render(appElement) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ui.initializeUI(appElement);
            yield this.connection.establishConnection();
        });
    }
    startGameSession() {
        this.log.startTime = Date.now();
        console.log(`Starting game session. Mode: ${this.log.mode}`);
        this.log.readyState = true;
    }
    endGameSession(result) {
        this.log.duration = Date.now() - this.log.startTime;
        this.log.result = result;
        console.log("Game session ended:", this.log);
        this.renderer.stopRenderLoop();
        this.log.readyState = false;
    }
    destroy() {
        this.connection.destroy();
        this.renderer.destroy();
    }
    /***********************************/
    /*********** SETTERS ***************/
    setGameLog(log) {
        if (log.id !== undefined)
            this.log.id = log.id;
        if (log.mode !== undefined)
            this.log.mode = log.mode;
        if (log.playerDetails !== undefined)
            this.log.playerDetails = log.playerDetails;
        if (log.startTime !== undefined)
            this.log.startTime = log.startTime;
        if (log.config !== undefined)
            this.log.config = log.config;
        if (log.result !== undefined)
            this.log.result = log.result;
        if (log.duration !== undefined)
            this.log.duration = log.duration;
        if (log.tournamentId !== undefined)
            this.log.tournamentId = log.tournamentId;
        if (log.readyState !== undefined)
            this.log.readyState = log.readyState;
    }
    setGameMode(mode) {
        this.log.mode = mode;
    }
    setGameConfig(config) {
        if (config.scoreLimit)
            this.gameConfig.scoreLimit = config.scoreLimit;
        if (config.difficulty)
            this.gameConfig.difficulty = config.difficulty;
        if (this.log)
            this.log.config = Object.assign({}, this.gameConfig);
    }
    setPlayerInfo(playerKey_1) {
        return __awaiter(this, arguments, void 0, function* (playerKey, data = null) {
            const user = yield this.connection.parseUserInfo(data);
            this.log.playerDetails[playerKey] = user;
        });
    }
    setGuestInfo(playerKey, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const wildcardID = name === 'guest' ? -1 : -2;
            const avatarPath = yield fetchRandomAvatarPath();
            const tempUser = {
                id: wildcardID,
                username: `${name}-${Date.now().toString(36)}`,
                tournamentUsername: 'name',
                email: `${name}-${Date.now().toString(36)}@email.com`,
                avatarPath: avatarPath
            };
            this.log.playerDetails[playerKey] = tempUser;
        });
    }
    setTournamentId(id) {
        this.log.tournamentId = id;
    }
    setGameMatch(match) {
        this.match = match;
    }
    setGameIsHost(state) {
        this.isHost = state;
    }
    setOnlineId(id) {
        this.onlineId = id;
    }
    /***********************************/
    /*********** GETTERS ***************/
    getGameConfig() {
        return (this.gameConfig);
    }
    getGameLog() {
        return (this.log);
    }
    getGameConnection() {
        return (this.connection);
    }
    getGameRender() {
        return (this.renderer);
    }
    getGameUI() {
        return (this.ui);
    }
    getGameMatch() {
        return (this.match);
    }
    getGameIsHost() {
        return (this.isHost);
    }
    isGameActive() {
        return (this.log.readyState);
    }
    getOnlineId() {
        return (this.onlineId);
    }
}
