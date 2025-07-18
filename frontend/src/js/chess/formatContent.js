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
export function formatLobbyList(data) {
    return __awaiter(this, void 0, void 0, function* () {
        let htmlText = '', htmlContent, lobbyHtmlContent, option, color, mode;
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
            lobbyHtmlContent = yield fetch("../../html/chess/lobbyItem.html");
            htmlContent = yield lobbyHtmlContent.text();
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
