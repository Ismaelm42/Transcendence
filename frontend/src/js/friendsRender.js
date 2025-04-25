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
import { searchUsersFriends } from './searchUsersFriends.js';
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
                const btnSearch = document.getElementById("btnSearch");
                if (btnSearch) {
                    searchUsersFriends(btnSearch);
                }
                // const searchTableTemplate = await fetch("../html/search_table.html");
                // if (!searchTableTemplate.ok) throw new Error("Failed to load the HTML file");
                // else 
                // {
                // 	const searchMainContainer = document.getElementById("search-main-container");
                // 	let searchTableContent = await searchTableTemplate.text();
                // 	if (searchMainContainer && searchTableContent) {
                // 		searchMainContainer.innerHTML += searchTableContent;
                // 	}
                // 	const btnSearch =  document.getElementById("btnSearch");
                // 	if (btnSearch) {
                // 		searchUsersFriends(btnSearch as HTMLElement);
                // 	}
                // }
                // handleStats(userStats);
            }
            catch (error) {
                console.error("Error loading HTML file:", error);
                appElement.innerHTML = `<div id="pong-container">An error occurred while generating the content</div>`;
            }
        });
    }
}
