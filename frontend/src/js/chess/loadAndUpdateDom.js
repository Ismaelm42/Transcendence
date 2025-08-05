var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function saveNotation() {
    return __awaiter(this, void 0, void 0, function* () {
        const notationsItems = document.getElementById('notations-items');
        localStorage.setItem('notationHTML', notationsItems.innerHTML);
    });
}
export function loadNotation() {
    return __awaiter(this, void 0, void 0, function* () {
        const saved = localStorage.getItem('notationHTML');
        if (saved) {
            const notationsItems = document.getElementById('notations-items');
            if (notationsItems)
                notationsItems.innerHTML = saved;
        }
    });
}
export function deleteNotation() {
    const notationsItems = document.getElementById('notations-items');
    if (notationsItems)
        notationsItems.innerHTML = '';
    localStorage.removeItem('notationHTML');
}
