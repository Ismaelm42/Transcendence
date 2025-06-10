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
import { Step } from "../spa/stepRender.js";
// Default container ID (I think it must match HTML file)
const DEFAULT_CONTAINER_ID = "tournament-container";
export class Tournament extends Step {
    constructor(containerId = DEFAULT_CONTAINER_ID) {
        super(DEFAULT_CONTAINER_ID);
        this.currentMatchIndex = 0;
        this.bracket = undefined;
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
            // setupListeners() method for forms, submit, buttons...
        });
    }
    // Set main config, function trigger when config-panel fill and clicked on next
    tournamentMainConfig() {
        // Sets this.config
        // Sets players[] size
        // Sets bracket[] size
    }
    // Set player info, called once per player-card trigger button
    // Could import setPlayerInfo from GamePlaye
    assignPlayer() {
    }
    // Matchmaking first (or random) and then fill each game.log (metadata) of the array
    generateBracket() {
    }
    // Create new Game instance, set the needed params (i think log will be enough)
    //		and start the usual workflow client-server to start the match in its own step
    launchNextMatch() {
        // const matchData = this.bracket[this.currentMatchIndex];
        const game = new Game();
        // game.setGameLog(matchData);
        // Navigate to game-match step, passing game instance
    }
    // Receive and gather game results - may need to improve gameMatch class to pass this info
    handleMatchResult(result) {
        // Aux method -> Update bracket, increment currentMatchIndex, etc.
    }
}
