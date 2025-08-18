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
import { searchUsersFriends } from './friendsSearchUsers.js';
import { renderRelations } from './renderRelations.js';
import { getUserId } from '../chat/handleSenders.js';
export let currentUserId = "";
export default class Friends extends Step {
    render(appElement) {
        return __awaiter(this, void 0, void 0, function* () {
            sessionStorage.setItem("current-view", "Friends");
            if (!this.username) {
                this.username = yield this.checkAuth();
            }
            try {
                const response = yield fetch("../../html/friends/friends.html");
                if (!response.ok)
                    throw new Error("Failed to load the HTML file");
                let htmlContent = yield response.text();
                appElement.innerHTML = htmlContent;
                let btnSearch = document.getElementById("btnSearch");
                while (!btnSearch) {
                    yield new Promise(resolve => setTimeout(resolve, 100)); // Wait for 100ms
                    btnSearch = document.getElementById("btnSearch");
                }
                btnSearch.addEventListener("click", (event) => searchUsersFriends('boton', event));
                const userId = yield getUserId(this.username);
                currentUserId = userId;
                if (!userId) {
                    throw new Error("User ID not found");
                }
                console.log("User ID:", userId);
                const relationsContainer = document.getElementById("relations-container");
                yield renderRelations(relationsContainer, userId);
                // --- Listeners persistentes para evitar duplicados ---
                // @ts-ignore
                if (!window._friendsListeners)
                    window._friendsListeners = {};
                // @ts-ignore
                const listeners = window._friendsListeners;
                // onlineUsersUpdated
                if (listeners.onlineListener)
                    window.removeEventListener("onlineUsersUpdated", listeners.onlineListener);
                listeners.onlineListener = () => __awaiter(this, void 0, void 0, function* () { yield renderRelations(relationsContainer, userId); });
                window.addEventListener("onlineUsersUpdated", listeners.onlineListener);
                // refreshRelations
                if (listeners.refreshListener)
                    window.removeEventListener("refreshRelations", listeners.refreshListener);
                listeners.refreshListener = () => __awaiter(this, void 0, void 0, function* () { yield renderRelations(relationsContainer, userId); });
                window.addEventListener("refreshRelations", listeners.refreshListener);
                // const eventKey = "onlineUsersUpdated";
                // const listener = async () => {
                // 	await renderRelations(relationsContainer!, userId);
                // };
                // // @ts-ignore
                // if (!window._onlineUsersUpdatedListenerAdded) {
                // 	window.addEventListener(eventKey, listener);
                // 	// @ts-ignore
                // 	window._onlineUsersUpdatedListenerAdded = true;
                // }
            }
            catch (error) {
                console.error("Error loading HTML file:", error);
                appElement.innerHTML = `<div id="pong-container">An error occurred while generating the content</div>`;
            }
        });
    }
}
