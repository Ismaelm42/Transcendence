export function showPromotionOptions() {
    var _a, _b;
    (_a = document.getElementById("overlay")) === null || _a === void 0 ? void 0 : _a.classList.remove("hidden");
    (_b = document.getElementById("modal")) === null || _b === void 0 ? void 0 : _b.classList.remove("hidden");
}
export function hidePromotionOptions() {
    var _a, _b;
    (_a = document.getElementById("overlay")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
    (_b = document.getElementById("modal")) === null || _b === void 0 ? void 0 : _b.classList.add("hidden");
}
