var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Step } from '../spa/stepRender.js';
import { verifySocket } from './verifySocket.js';
import { filterSearchUsers } from './filterSearch.js';
import { handleSocketEvents } from './handleSocketEvents.js';
import { handleContentStorage } from './loadAndUpdateDOM.js';
import { showUserOptionsMenu } from './handleUserOptionsMenu.js';
import { removeNotificationChatTab } from './loadAndUpdateDOM.js';
import { getUserId, handleFormSubmit, handlePrivateMsg, showPrivateChat } from './handleSenders.js';
export default class Chat extends Step {
    render(appElement) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.username) {
                this.username = yield this.checkAuth();
            }
            sessionStorage.setItem("current-view", "Chat");
            try {
                const htmlContent = yield fetch("../../html/chat/chat.html");
                if (!htmlContent.ok) {
                    throw new Error("Failed to load the HTML file");
                }
                const htmlText = yield htmlContent.text();
                appElement.innerHTML = htmlText;
                const form = document.getElementById("chat-form");
                const textarea = document.getElementById("chat-textarea");
                const chatMessages = document.getElementById("chat-messages");
                const items = document.getElementById("user-item-container");
                const searchInput = document.getElementById("search-users-input");
                const recentChats = document.getElementById("chat-item-list-container");
                const userId = yield getUserId(this.username);
                removeNotificationChatTab();
                handleContentStorage(chatMessages, recentChats, userId);
                Step.chatSocket = verifySocket(Step.chatSocket);
                handleSocketEvents(Step.chatSocket, chatMessages, recentChats, userId);
                textarea.addEventListener('keydown', e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), form.requestSubmit()));
                form.addEventListener('submit', (e) => handleFormSubmit(e, textarea, Step.chatSocket));
                searchInput.addEventListener('keydown', e => e.key === 'Enter' && e.preventDefault());
                searchInput.addEventListener('input', () => filterSearchUsers(searchInput.value));
                items.addEventListener('dblclick', (e) => handlePrivateMsg(e, Step.chatSocket));
                recentChats.addEventListener('click', (e) => showPrivateChat(e, Step.chatSocket, userId));
                items.addEventListener("click", (event) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    const target = event.target;
                    const userItem = target.closest(".item");
                    if (!userItem)
                        return;
                    const usernameSpan = userItem.querySelector("span.text-sm");
                    const clickedUsername = (_a = usernameSpan === null || usernameSpan === void 0 ? void 0 : usernameSpan.textContent) === null || _a === void 0 ? void 0 : _a.trim();
                    const userId = yield getUserId(this.username);
                    const clickedUserId = yield getUserId(clickedUsername);
                    if (clickedUserId && clickedUserId !== userId) {
                        showUserOptionsMenu(userItem, event, Step.chatSocket, userId);
                    }
                }));
            }
            catch (error) {
                appElement.innerHTML = `<div id="pong-container">An error occurred while generating the content</div>`;
            }
        });
    }
}
