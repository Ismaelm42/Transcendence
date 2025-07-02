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
import { sendGameConfig } from './handleSenders.js';
import { getConfigHtml, getChessHtml } from './handleFetchers.js';
import { preloadImages, setupChessboard } from './drawChessboard.js';
import { userId, appContainer, chessboard, setChessboard, setCanvas } from './state.js';
export function checkIfGameIsRunning() {
    return sessionStorage.getItem("chessboard") || "";
}
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
function launchConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        appContainer.innerHTML = yield getConfigHtml();
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
        start.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
            const data = getConfig();
            sendGameConfig(data);
            yield launchGame(data);
        }));
    });
}
function launchLobby() {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
export function launchUI() {
    return __awaiter(this, void 0, void 0, function* () {
        yield launchConfig();
        yield launchLobby();
    });
}
export function launchGame(data) {
    return __awaiter(this, void 0, void 0, function* () {
        appContainer.innerHTML = yield getChessHtml();
        setCanvas();
        setChessboard(data);
        preloadImages(() => {
            setupChessboard(chessboard, null, null);
            handleEvents();
        });
    });
}
