export function showGameOverOptions() {
    var _a, _b, _c, _d, _e, _f;
    (_a = document.getElementById("board-overlay")) === null || _a === void 0 ? void 0 : _a.classList.remove("hidden");
    (_b = document.getElementById("modal-game-over")) === null || _b === void 0 ? void 0 : _b.classList.remove("hidden");
    (_c = document.getElementById("sidebar-overlay")) === null || _c === void 0 ? void 0 : _c.classList.remove("hidden");
    (_d = document.getElementById("draw")) === null || _d === void 0 ? void 0 : _d.classList.add("hidden");
    (_e = document.getElementById("resign")) === null || _e === void 0 ? void 0 : _e.classList.add("hidden");
    (_f = document.getElementById("return")) === null || _f === void 0 ? void 0 : _f.classList.remove("hidden");
}
export function hideGameOverOptions() {
    var _a;
    (_a = document.getElementById("modal-game-over")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
}
