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
import { showMessage } from '../modal/showMessage.js';
import { searchUsersFriends } from './friendsSearchUsers.js';
export class BcRemoveBlockItem extends BasicComponent {
    constructor() {
        super('../../html/friends/BcRemoveBlockItem.html', () => {
            this.bindEvents();
        });
    }
    bindEvents() {
        var _a, _b;
        const btn = (_a = this.el) === null || _a === void 0 ? void 0 : _a.querySelector('.btnRemoveFriend');
        btn === null || btn === void 0 ? void 0 : btn.addEventListener('click', (e) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const btn = e.currentTarget;
            const wrapper = btn.closest('div.flex');
            if (!wrapper)
                return;
            const span = wrapper.querySelector('span[data-user-id]');
            if (!span)
                return;
            const userId = (_a = span.textContent) === null || _a === void 0 ? void 0 : _a.trim();
            console.log('ID del usuario:', userId);
            const requestBody = {
                friendId: userId
            };
            try {
                console.log("En BcRemoveBlockItem");
                console.log("btn:", btn);
                const response = yield fetch("https://localhost:8443/back/delete_friend", {
                    method: "POST",
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                });
                if (response.ok) {
                    showMessage(`Friend removed successfully:`, null);
                    searchUsersFriends('codigo');
                }
                else {
                    const errorMessage = yield response.json();
                    showMessage(errorMessage.error, null);
                }
            }
            catch (error) {
                console.error("Error removing friend request");
            }
        }));
        const btn2 = (_b = this.el) === null || _b === void 0 ? void 0 : _b.querySelector('.btnBlockItem');
        btn2 === null || btn2 === void 0 ? void 0 : btn2.addEventListener('click', (e) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const btn2 = e.currentTarget;
            const wrapper = btn2.closest('div.flex');
            if (!wrapper)
                return;
            const span = wrapper.querySelector('span[data-user-id]');
            if (!span)
                return;
            const userId = (_a = span.textContent) === null || _a === void 0 ? void 0 : _a.trim();
            console.log('ID del usuario:', userId);
            const requestBody = {
                friendId: userId
            };
            try {
                console.log("En BcRemoveBlockItem");
                console.log("btn:", btn);
                const response = yield fetch("https://localhost:8443/back/block_user", {
                    method: "POST",
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                });
                if (response.ok) {
                    showMessage(`Friend blocked successfully:`, null);
                    searchUsersFriends('codigo');
                }
                else {
                    const errorMessage = yield response.json();
                    showMessage(errorMessage.error, null);
                }
            }
            catch (error) {
                console.error("Error blocking friend");
            }
        }));
    }
}
