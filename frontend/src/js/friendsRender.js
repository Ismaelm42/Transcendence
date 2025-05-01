var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Step } from './stepRender.js';
import { searchUsersFriends } from './friendsSearchUsers.js';
export default class Friends extends Step {
    render(appElement) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("En Friend render");
            if (!this.username) {
                this.username = yield this.checkAuth();
            }
            try {
                const response = yield fetch("../html/friends.html");
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
            }
            catch (error) {
                console.error("Error loading HTML file:", error);
                appElement.innerHTML = `<div id="pong-container">An error occurred while generating the content</div>`;
            }
        });
    }
}
