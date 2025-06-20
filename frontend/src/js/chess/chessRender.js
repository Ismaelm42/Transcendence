var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Step } from '../spa/stepRender.js';
import { Chessboard } from './chessboardClass.js';
import { getChessHtml, getUserId } from './handleFetchers.js';
import { handleEvents } from './handleEvents.js';
import { createCanvas, preloadImages, setupChessboard } from './drawChessboard.js';
export default class Chess extends Step {
    render(appElement) {
        return __awaiter(this, void 0, void 0, function* () {
            sessionStorage.setItem("current-view", "Chess");
            if (!this.username) {
                this.username = yield this.checkAuth();
            }
            try {
                appElement.innerHTML = yield getChessHtml();
                const board = document.getElementById("board");
                const userId = yield getUserId(this.username);
                const chessboard = new Chessboard();
                chessboard.init();
                const canvas = createCanvas(board);
                preloadImages(() => {
                    setupChessboard(chessboard, canvas, null, null, null, null);
                    handleEvents(chessboard, canvas);
                });
            }
            catch (error) {
                console.log(error);
                appElement.innerHTML = `<div id="pong-container">An error occurred while generating the content</div>`;
            }
        });
    }
}
