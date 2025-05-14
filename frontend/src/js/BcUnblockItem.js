var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BasicComponent } from './BasicComponent.js';
import { showMessage } from './showMessage.js';
import { searchUsersFriends } from './friendsSearchUsers.js';
export class BcUnblockItem extends BasicComponent {
    constructor() {
        super('../html/BcUnblockItem.html', () => {
            this.bindEvents();
        });
    }
    bindEvents() {
        var _a;
        const btn = (_a = this.el) === null || _a === void 0 ? void 0 : _a.querySelector('.btnUnblockItem');
        btn === null || btn === void 0 ? void 0 : btn.addEventListener('click', (e) => __awaiter(this, void 0, void 0, function* () {
            var _b;
            const btn = e.currentTarget;
            const wrapper = btn.closest('div.flex');
            if (!wrapper)
                return;
            const span = wrapper.querySelector('span[data-user-id]');
            if (!span)
                return;
            const userId = (_b = span.textContent) === null || _b === void 0 ? void 0 : _b.trim();
            console.log('ID del usuario:', userId);
            const requestBody = {
                friendId: userId
            };
            try {
                const response = yield fetch("https://localhost:8443/back/unblock_user", {
                    method: "POST",
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                });
                if (response.ok) {
                    showMessage(`User unblocked successfully:`, null);
                    searchUsersFriends('codigo');
                }
                else {
                    const errorMessage = yield response.json();
                    showMessage(errorMessage.error, null);
                }
            }
            catch (error) {
                console.error("Error unblocking user");
            }
        }));
    }
}
