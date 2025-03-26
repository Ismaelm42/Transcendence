var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { SPA } from './spa.js';
const loginButton = document.getElementById("loginButton");
const loginContainer = document.getElementById("app-container");
const menuContainer = document.getElementById("menu-container");
function handleLoginSubmit(event) {
    return __awaiter(this, void 0, void 0, function* () {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        try {
            const response = yield fetch("https://localhost:8443/back/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const errorResponse = yield response.json();
                alert(`Error message: , ${errorResponse.message}`);
                //throw new Error("Failed to send data");
            }
            else {
                const result = yield response.json();
                console.log("Data sent successfully:", result);
                if (loginContainer)
                    loginContainer.innerHTML = "";
                if (menuContainer)
                    menuContainer.innerHTML =
                        `<nav id="nav" class="bg-gray-800 p-4 hidden">
				<ul class="flex space-x-4">
					<li><a href="#play-pong" class="text-white hover:text-gray-400">Play Game</a></li>
					<li><a href="#play-tournament" class="text-white hover:text-gray-400">Start Tournament</a></li>
					<li><a href="#friends" class="text-white hover:text-gray-400">Friends</a></li>
					<li><a href="#chat" class="text-white hover:text-gray-400">Chat</a></li>
					<li><a href="#stats">Stats</a></li>
				</ul>
			</nav>`;
                // // se podría crear en una función navigate y llamarla navigate('#home');
                // history.pushState(null, '', '#home');
                // const homeEvent = new Event("home");
                // document.dispatchEvent(homeEvent);
                const app = new SPA('content');
                app.navigate("#home");
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
function render() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch("../html/login.html");
            if (!response.ok)
                throw new Error("Failed to load the HTML file");
            const htmlContent = yield response.text();
            history.pushState(null, '', '/login');
            if (loginContainer) {
                loginContainer.innerHTML = htmlContent;
                const form = loginContainer.querySelector("form");
                form === null || form === void 0 ? void 0 : form.addEventListener("submit", handleLoginSubmit);
                const signUp = loginContainer.querySelector("#signUp");
                signUp === null || signUp === void 0 ? void 0 : signUp.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                    yield import('./register.js').then(module => module.render());
                }));
                // document.getElementById("loginButton")?.classList.add("hidden");
                // document.getElementById("registerButton")?.classList.remove("hidden");
                // document.getElementById("headerSeparator")?.classList.add("hidden");
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
document.addEventListener("DOMContentLoaded", () => {
    loginButton === null || loginButton === void 0 ? void 0 : loginButton.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
        yield render();
    }));
});
export { render, handleLoginSubmit };
