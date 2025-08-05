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
import { getLobbyHtml } from './handleFetchers.js';
import { loadNotation } from './loadAndUpdateDom.js';
import { formatChessGame } from './formatContent.js';
import { preloadImages, setupChessboard } from './drawChessboard.js';
import { requestLobbyList, sendGameConfig } from './handleSenders.js';
import { userId, appContainer, chessboard, setChessboard, setCanvas } from './state.js';
function getConfig() {
    const playerColor = document.getElementById('color').value;
    const timeControl = document.getElementById('time').value;
    const gameMode = document.getElementById('mode').value;
    const minRating = document.getElementById('minRating').value;
    const maxRating = document.getElementById('maxRating').value;
    let dataPlayerColor, dataTimeControl, dataGameMode, dataMinRating, dataMaxRating;
    dataPlayerColor = playerColor;
    dataTimeControl = timeControl;
    dataGameMode = gameMode;
    dataMinRating = (minRating === "any") ? -10000 : parseInt(minRating, 10);
    dataMaxRating = (maxRating === "any") ? 10000 : parseInt(maxRating, 10);
    const data = {
        userId: userId,
        playerColor: dataPlayerColor,
        timeControl: dataTimeControl,
        gameMode: dataGameMode,
        minRating: dataMinRating,
        maxRating: dataMaxRating,
    };
    return data;
}
export function launchUI() {
    return __awaiter(this, void 0, void 0, function* () {
        appContainer.innerHTML = yield getLobbyHtml();
        const start = document.getElementById('start-game');
        const modeSelect = document.getElementById('mode');
        const minRating = document.getElementById('minRating');
        const maxRating = document.getElementById('maxRating');
        function blockRatingBracket() {
            if (modeSelect.value === "local") {
                minRating.value = 'any';
                maxRating.value = 'any';
                minRating.disabled = true;
                maxRating.disabled = true;
            }
            else {
                minRating.disabled = false;
                maxRating.disabled = false;
            }
        }
        blockRatingBracket();
        requestLobbyList();
        modeSelect.addEventListener('change', () => blockRatingBracket());
        start.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
            const data = getConfig();
            sendGameConfig(data);
        }));
    });
}
export function launchGame(data) {
    return __awaiter(this, void 0, void 0, function* () {
        appContainer.innerHTML = yield formatChessGame(data);
        loadNotation();
        setCanvas();
        setChessboard(data);
        preloadImages(() => {
            setupChessboard(chessboard, null, null);
            handleEvents();
        });
    });
}
