var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function getPromotionOptions(data) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        (_a = document.getElementById("overlay")) === null || _a === void 0 ? void 0 : _a.classList.remove("hidden");
        (_b = document.getElementById("modal")) === null || _b === void 0 ? void 0 : _b.classList.remove("hidden");
    });
}
