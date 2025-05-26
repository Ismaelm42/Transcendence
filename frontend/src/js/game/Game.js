/**
 * Game.ts -> main class file with core functionality
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
        console.log("Game constructor called");
        this.connection = new GameConnection(this);
        this.renderer = new GameRender(this);
        this.ui = new GameUI(this);
    }
    render(appElement) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ui.initializeUI(appElement);
            yield this.connection.establishConnection();
            this.ui.setupEventListeners();
        });
    }
    destroy() {
        this.connection.destroy();
        this.renderer.destroy();
    }
}
