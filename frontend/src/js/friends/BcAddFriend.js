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
export class BcAddFriend extends BasicComponent {
    constructor() {
        super('../../html/friends/BcAddfriendItem.html', () => {
            this.bindEvents();
        });
    }
    bindEvents() {
        var _a;
        const btn = (_a = this.el) === null || _a === void 0 ? void 0 : _a.querySelector('.btnAddfriend');
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
                const response = yield fetch("https://localhost:8443/back/send_friend_request", {
                    method: "POST",
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                });
                if (response.ok) {
                    showMessage(`Friend request sent successfully:`, null);
                    searchUsersFriends('codigo');
                }
                else {
                    const errorMessage = yield response.json();
                    showMessage(errorMessage.error, null);
                }
            }
            catch (error) {
                console.error("Error sending friend request");
            }
        }));
    }
}
