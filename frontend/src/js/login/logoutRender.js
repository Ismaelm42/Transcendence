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
export default class LoginRender extends Step {
    render(appElement) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("En logout render");
            try {
                const response = yield fetch("https://localhost:8443/back/auth/logout", {
                    method: "POST",
                    credentials: "include",
                });
                if (!response.ok)
                    throw new Error("Failed to logout");
                console.log("User logged out successfully.");
                document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                sessionStorage.clear();
                sessionStorage.removeItem("chatHTML");
                // Redirigir a la página principal
                appElement.innerHTML = `<div id="pong-container">
									<div class="paddle left-paddle"></div>
									<h2> Logout successful, redirecting to home...</h2>
									<div class="paddle right-paddle"></div>
									</div>`;
                setTimeout(() => {
                    window.location.hash = "#home";
                }, 2000);
            }
            catch (error) {
                console.error("Error during logout:", error);
                // appElement.innerHTML =  "<h1>Logout failed</h1>";
            }
        });
    }
}
