/**
 * utils.ts -> aux or helper functions not on the scope of a class, interface or type
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function fetchRandomAvatarPath() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch('https://localhost:8443/back/random_avatar');
        if (response.ok) {
            const data = yield response.json();
            return (data.avatarPath);
        }
        return (null);
    });
}
