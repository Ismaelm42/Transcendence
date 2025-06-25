var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { handleEvents } from './handleEvents.js';
import { Chessboard } from './chessboardClass.js';
import { handleSocketEvents } from '../chess/handleSocketEvents.js';
import { createCanvas, preloadImages, setupChessboard } from './drawChessboard.js';
import { getLaunchGameHtml, getChessHtml } from './handleFetchers.js';
export function checkIfGameIsRunning() {
    return sessionStorage.getItem("chess") || "";
}
function initChessboard() {
    const chessboard = new Chessboard();
    chessboard.init();
    const color = document.getElementById('color').value;
    const time = document.getElementById('time').value;
    const mode = document.getElementById('mode').value;
    const minRating = document.getElementById('minRating').value;
    const maxRating = document.getElementById('maxRating').value;
    if (color === 'random') {
        const options = ['white', 'black'];
        const randomIndex = Math.floor(Math.random() * options.length);
        chessboard.color = options[randomIndex];
    }
    else {
        chessboard.color = color;
    }
    chessboard.time = time;
    chessboard.mode = mode;
    chessboard.minRating = parseInt(minRating, 10);
    chessboard.maxRating = parseInt(maxRating, 10);
    return chessboard;
}
export function launchUI(socket, userId, game, appElement) {
    return __awaiter(this, void 0, void 0, function* () {
        appElement.innerHTML = yield getLaunchGameHtml();
        const start = document.getElementById('start-game');
        const modeContainer = document.getElementById('modeContainer');
        const modeSelect = document.getElementById('mode');
        function toggleModeVisibility(modeContainer, modeSelect) {
            if (modeSelect.value === 'online')
                modeContainer.classList.remove('hidden');
            else
                modeContainer.classList.add('hidden');
        }
        modeSelect.addEventListener('change', () => toggleModeVisibility(modeContainer, modeSelect));
        start.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () { return yield launchGame(socket, userId, game, appElement); }));
    });
}
export function launchGame(socket, userId, game, appElement) {
    return __awaiter(this, void 0, void 0, function* () {
        const chessboard = initChessboard();
        appElement.innerHTML = yield getChessHtml();
        const board = document.getElementById("board");
        const canvas = createCanvas(board);
        preloadImages(() => {
            setupChessboard(chessboard, canvas, null, null);
            handleEvents(socket, userId, chessboard, canvas);
            handleSocketEvents(socket, userId, chessboard, canvas);
        });
    });
}
