var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function hidePromotionOptions() {
    var _a, _b;
    (_a = document.getElementById("board-overlay")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
    (_b = document.getElementById("modal-promotion")) === null || _b === void 0 ? void 0 : _b.classList.add("hidden");
}
export function showPromotionOptions() {
    var _a, _b;
    (_a = document.getElementById("board-overlay")) === null || _a === void 0 ? void 0 : _a.classList.remove("hidden");
    (_b = document.getElementById("modal-promotion")) === null || _b === void 0 ? void 0 : _b.classList.remove("hidden");
}
export function hideBoardOverlay() {
    var _a;
    (_a = document.getElementById("board-overlay")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
}
export function showBoardOverlay() {
    var _a;
    (_a = document.getElementById("board-overlay")) === null || _a === void 0 ? void 0 : _a.classList.remove("hidden");
}
export function hideSidebarOverlay() {
    var _a;
    (_a = document.getElementById("sidebar-overlay")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
}
export function showSidebarOverlay() {
    var _a;
    (_a = document.getElementById("sidebar-overlay")) === null || _a === void 0 ? void 0 : _a.classList.remove("hidden");
}
export function hideGameOverOptions() {
    var _a;
    (_a = document.getElementById("modal-game-over")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
}
export function saveChessGame(data) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("saveChessGame: ", data);
        let Chessgamelog = {
            user1: data.hostId,
            user2: data.hostId && data.hostId !== data.guestId ? data.guestId : -2, // -2 for guest player
            draw: false,
            winner: (data.winner === "Guest") ? -2 : data.winnerId,
            loser: (data.loser === "Guest") ? -2 : data.loserId,
            winnerStr: data.winner,
            loserStr: data.loser,
            color: data.color,
            endtype: data.type,
        };
        if (Chessgamelog.user2 === null || Chessgamelog.user2 === undefined
            || Chessgamelog.user1 === null || Chessgamelog.user1 === undefined) {
            if (data.winner === "Guest" || data.loser === "Guest") {
                Chessgamelog.user2 = -2; // -2 for guest player
            }
            else {
                Chessgamelog.user1 = data.winnerId;
                Chessgamelog.user2 = data.loserId;
            }
        }
        // If draw, set winner and loser to null
        if (data.type === "agreement") {
            Chessgamelog.draw = true;
            Chessgamelog.winner = null;
            Chessgamelog.loser = null;
            Chessgamelog.winnerStr = null;
            Chessgamelog.loserStr = null;
        }
        console.log("Chessgamelog to be sent: ", Chessgamelog);
        try {
            const response = yield fetch("https://localhost:8443/back/post_chessgamelog", {
                method: "POST",
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Chessgamelog)
            });
            const result = yield response.json();
            if (!response.ok) {
                console.log(`Error: ${result.message}`);
            }
            else {
                if (result && result.id && result.id == -42)
                    console.log("Online game: Game log already saved by the host: ", result);
                else
                    console.log("Game log saved successfully:", result);
            }
        }
        catch (error) {
            console.error("Error while verifying:", error);
        }
    });
}
export function showGameOverOptions(data) {
    var _a, _b, _c, _d;
    showBoardOverlay();
    showSidebarOverlay();
    hideConfirmationDraw();
    hideConfirmationResign();
    hideRequestDrawOptions();
    saveChessGame(data);
    (_a = document.getElementById("modal-game-over")) === null || _a === void 0 ? void 0 : _a.classList.remove("hidden");
    (_b = document.getElementById("draw")) === null || _b === void 0 ? void 0 : _b.classList.add("hidden");
    (_c = document.getElementById("resign")) === null || _c === void 0 ? void 0 : _c.classList.add("hidden");
    (_d = document.getElementById("return")) === null || _d === void 0 ? void 0 : _d.classList.remove("hidden");
    if (data.winner) {
        document.getElementById("game-result").classList.remove("hidden");
        document.getElementById("winner-name").textContent = data.winner;
        document.getElementById("end-reason").textContent = 'by ' + data.type;
    }
    else {
        document.getElementById("draw-result").classList.remove("hidden");
        document.getElementById("draw-reason").textContent = 'by ' + data.type;
    }
}
export function hideRequestRematchOptions() {
    var _a;
    (_a = document.getElementById("modal-rematch")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
}
export function showRequestRematchOptions(data) {
    hideGameOverOptions();
    document.getElementById("modal-rematch").classList.remove("hidden");
    const message = document.getElementById("rematch-options-message");
    let timeLeft = 10.0;
    message.textContent = data.username + ' has invited you to a rematch ' + timeLeft.toFixed(1);
    const intervalId = setInterval(() => {
        timeLeft -= 0.1;
        if (timeLeft <= 0) {
            clearInterval(intervalId);
            message.textContent = data.username + ' has invited you to a rematch 0.0';
            hideRequestRematchOptions();
            hideSidebarOverlay();
        }
        else
            message.textContent = data.username + ' has invited you to a rematch ' + timeLeft.toFixed(1);
    }, 100);
}
export function hideRequestRematchWaiting() {
    var _a;
    (_a = document.getElementById("modal-rematch-waiting")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
}
export function showRequestRematchWaiting() {
    const message = document.getElementById("rematch-waiting-message");
    document.getElementById("modal-rematch-waiting").classList.remove("hidden");
    let timeLeft = 10.0;
    message.textContent = 'Waiting for opponent ' + timeLeft.toFixed(1);
    const intervalId = setInterval(() => {
        timeLeft -= 0.1;
        if (timeLeft <= 0) {
            clearInterval(intervalId);
            message.textContent = 'Waiting for opponent 0.0';
            hideRequestRematchWaiting();
            hideSidebarOverlay();
        }
        else
            message.textContent = 'Waiting for opponent ' + timeLeft.toFixed(1);
    }, 100);
}
export function hideResponseRematchDeclined() {
    var _a;
    (_a = document.getElementById("modal-rematch-declined")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
}
export function showResponseRematchDeclined(data) {
    hideRequestRematchWaiting();
    document.getElementById("modal-rematch-declined").classList.remove("hidden");
    document.getElementById("declined-reason").textContent = data.opponentName + ' ' + data.reason;
}
export function hideConfirmationDraw() {
    var _a;
    (_a = document.getElementById("modal-confirmDraw")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
}
export function showConfirmationDraw() {
    var _a, _b;
    (_a = document.getElementById("modal-confirmResign")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
    (_b = document.getElementById("modal-confirmDraw")) === null || _b === void 0 ? void 0 : _b.classList.remove("hidden");
}
export function hideConfirmationResign() {
    var _a;
    (_a = document.getElementById("modal-confirmResign")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
}
export function showConfirmationResign() {
    var _a, _b;
    (_a = document.getElementById("modal-confirmDraw")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
    (_b = document.getElementById("modal-confirmResign")) === null || _b === void 0 ? void 0 : _b.classList.remove("hidden");
}
export function hideRequestDrawOptions() {
    document.getElementById("modal-requestDraw").classList.add("hidden");
}
export function showRequestDrawOptions(data) {
    document.getElementById("modal-requestDraw").classList.remove("hidden");
    const message = document.getElementById("requestDraw-options-message");
    message.textContent = data.username + ' ' + 'offered a draw';
}
export function hideReplayOverlay() {
    var _a;
    (_a = document.getElementById("replay-overlay")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
}
export function showReplayOverlay() {
    var _a;
    (_a = document.getElementById("replay-overlay")) === null || _a === void 0 ? void 0 : _a.classList.remove("hidden");
}
