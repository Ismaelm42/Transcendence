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
// Default container ID (I think i should match HTML file)
const DEFAULT_CONTAINER_ID = "game-container";
export default class Game extends Step {
    /***************************************/
    /*********** CONSTRUCTOR ***************/
    constructor(containerId = DEFAULT_CONTAINER_ID) {
        super(containerId);
        this.gameConfig = { scoreLimit: 5, difficulty: 'medium' };
        this.match = null;
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
    }
    endGameSession(result) {
        this.log.duration = Date.now() - this.log.startTime;
        this.log.result = result;
        console.log("Game session ended:", this.log);
        this.renderer.stopRenderLoop();
    }
    destroy() {
        this.connection.destroy();
        this.renderer.destroy();
    }
    /***********************************/
    /*********** SETTERS ***************/
    setGameLog(log) {
        this.log = log;
    }
    setGameMode(mode) {
        this.log.mode = mode;
    }
    setGameConfig(config) {
        this.log.config = config;
    }
    setPlayerInfo(playerKey_1) {
        return __awaiter(this, arguments, void 0, function* (playerKey, data = null) {
            const user = yield this.connection.parseUserInfo(data);
            this.log[playerKey] = user;
        });
    }
    setGuestInfo(playerKey, name) {
        const tempUser = {
            id: `${name}-${Date.now()}`,
            username: name,
            tournamentUsername: 'name',
            email: `${name}@email.com`,
            avatarPath: '/images/default-avatar.png'
        };
        this.log[playerKey] = tempUser;
    }
    setTournamentId(id) {
        this.log.tournamentId = id;
    }
    setGameMatch(match) {
        this.match = match;
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
}
