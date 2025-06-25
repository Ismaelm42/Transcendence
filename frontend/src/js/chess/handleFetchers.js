var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function getLaunchGameHtml() {
    return __awaiter(this, void 0, void 0, function* () {
        const htmlContent = yield fetch("../../html/chess/launchGame.html");
        if (!htmlContent.ok)
            throw new Error("Failed to load the HTML file");
        const htmlText = yield htmlContent.text();
        return htmlText;
    });
}
export function getChessHtml() {
    return __awaiter(this, void 0, void 0, function* () {
        const htmlContent = yield fetch("../../html/chess/chess.html");
        if (!htmlContent.ok)
            throw new Error("Failed to load the HTML file");
        const htmlText = yield htmlContent.text();
        return htmlText;
    });
}
export function getUserId(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = yield fetch("https://localhost:8443/back/getIdByUsername", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: username
            }),
        });
        if (!id.ok)
            throw new Error("Failed to fetch user ID");
        return id.text();
    });
}
