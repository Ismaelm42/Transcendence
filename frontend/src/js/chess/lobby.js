var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { formatLobbyList } from "./formatContent.js";
import { sendOptionSelected } from "./handleSenders.js";
export function updateLobbyList(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const lobby = document.getElementById('games-list-container');
        if (lobby) {
            const Lobbies = yield formatLobbyList(data);
            lobby.innerHTML = Lobbies;
            const optionButtons = lobby.querySelectorAll('button');
            optionButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const target = e.target;
                    const itemWrapper = target.closest('.item-wrapper');
                    const id = itemWrapper.dataset.id;
                    if (id)
                        sendOptionSelected(id);
                });
            });
        }
    });
}
