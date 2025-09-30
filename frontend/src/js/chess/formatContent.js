var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { userId } from './state.js';
import { saveNotation } from './loadAndUpdateDom.js';
import { getLobbyItemHtml, getChessHtml } from './handleFetchers.js';
import { hideReplayOverlay, showReplayOverlay } from './handleModals.js';
export function formatLobbyList(data) {
    return __awaiter(this, void 0, void 0, function* () {
        let htmlText = '', htmlContent, option, color, mode;
        const lobbies = Object.values(data.object);
        for (const lobby of lobbies) {
            lobby.userId.toString() === userId ? option = "Cancel" : option = "Join";
            lobby.userId.toString() === userId ? color = "red" : color = "emerald";
            const minutes = parseInt(lobby.timeControl.split('|')[0], 10);
            if (minutes === 1 || minutes === 2)
                mode = "bullet";
            else if (minutes === 3 || minutes === 5)
                mode = "blitz";
            else
                mode = "rapid";
            htmlContent = yield getLobbyItemHtml();
            htmlContent = htmlContent
                .replace("{{ userId }}", lobby.userId.toString())
                .replace("{{ id }}", lobby.userId.toString())
                .replace("{{ username }}", lobby.username.toString())
                .replace("{{ rating }}", lobby.rating.toString())
                .replace("{{ color }}", lobby.playerColor.toString())
                .replace("{{ mode }}", mode.toString())
                .replace("{{ time }}", lobby.timeControl.toString())
                .replace("{{ bg-color }}", color.toString())
                .replace("{{ hover-color }}", color.toString())
                .replace("{{option}}", option.toString());
            htmlText += htmlContent;
        }
        return htmlText;
    });
}
export function formatChessGame(data) {
    return __awaiter(this, void 0, void 0, function* () {
        let htmlContent = yield getChessHtml();
        htmlContent = htmlContent
            .replace("{{ playerName }}", data.playerName)
            .replace("{{ playerElo }}", data.playerElo)
            .replace("{{ playerImagePath }}", data.playerImagePath)
            .replace("{{ playerTime }}", data.playerTime)
            .replace("{{ opponentName }}", data.opponentName)
            .replace("{{ opponentElo }}", data.opponentElo)
            .replace("{{ opponentImagePath }}", data.opponentImagePath)
            .replace("{{ opponentTime }}", data.opponentTime);
        return htmlContent;
    });
}
export function updateTime(data) {
    const playerTime = document.getElementById("player-time");
    const opponentTime = document.getElementById("opponent-time");
    if (playerTime)
        playerTime.textContent = data.playerTime;
    if (opponentTime)
        opponentTime.textContent = data.opponentTime;
}
export function updateOrInsertNotation(move, color, notation) {
    var _a;
    if (notation) {
        let notationElement = document.querySelector(`[data-move="${move}"]`);
        if (!notationElement) {
            (_a = document.querySelector('.selected')) === null || _a === void 0 ? void 0 : _a.classList.remove('selected');
            notationElement = document.createElement('div');
            notationElement.id = `notation-move-${move}`;
            notationElement.className = "grid grid-cols-[3em_8em_8em] items-center p-2 text-white border border-gray-400 selected";
            notationElement.dataset.move = move.toString();
            notationElement.innerHTML = `
				<span class="move-number">${move}.</span>
				<span class="white-move"></span>
				<span class="black-move"></span>
			`;
            document.getElementById('notations-items').appendChild(notationElement);
        }
        if (color === 'white')
            notationElement.querySelector('.white-move').textContent = notation;
        else
            notationElement.querySelector('.black-move').textContent = notation;
        saveNotation();
        const notationContainer = document.getElementById('notation-container');
        if (notationContainer)
            notationContainer.scrollTop = notationContainer.scrollHeight;
    }
}
export function flipSideBar(data) {
    const sidebar = document.getElementById('sidebar');
    const opponent = document.getElementById('opponent');
    const player = document.getElementById('player');
    opponent === null || opponent === void 0 ? void 0 : opponent.remove();
    player === null || player === void 0 ? void 0 : player.remove();
    const newOpponentHTML = `
		<div id="opponent" class="flex items-center gap-4 mb-4">
			<img src=${data.opponentImagePath} alt="opponentImage" class="w-12 h-12 rounded-full" />
			<div class="text-white text-lg sm:text-xl font-semibold truncate">
				${data.opponentName} (${data.opponentElo})
			</div>
			<div id="opponent-time"
				class="bg-gray-600 text-white font-bold text-3xl sm:text-4xl leading-none mt-1 ml-auto px-2 py-2 rounded">
				${data.opponentTime}
			</div>
		</div>
	`;
    const newPlayerHTML = `
		<div id="player" class="flex items-center gap-4">
			<img src=${data.playerImagePath} alt="playerImage" class="w-12 h-12 rounded-full shrink-0" />
			<div class="text-white text-lg sm:text-xl font-semibold truncate">
				${data.playerName} (${data.playerElo})
			</div>
			<div id="player-time"
				class="bg-gray-600 text-white font-bold text-3xl sm:text-4xl leading-none mt-1 ml-auto px-2 py-2 rounded">
				${data.playerTime}
			</div>
		</div>
	`;
    sidebar === null || sidebar === void 0 ? void 0 : sidebar.insertAdjacentHTML('afterbegin', newOpponentHTML);
    sidebar === null || sidebar === void 0 ? void 0 : sidebar.insertAdjacentHTML('beforeend', newPlayerHTML);
}
export function handleNavigation(data) {
    var _a;
    data.moveEnabled ? hideReplayOverlay() : showReplayOverlay();
    const target = document.getElementById(`notation-move-${data.currentMove}`);
    (_a = document.querySelector('.selected')) === null || _a === void 0 ? void 0 : _a.classList.remove('selected');
    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.classList.add('selected');
    }
    else {
        const notationContainer = document.getElementById('notation-container');
        if (notationContainer)
            notationContainer.scrollTop = 0;
    }
}
