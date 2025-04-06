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
export default class LoginRender extends Step {
    render() {
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
                // Redirigir a la página principal
                window.location.hash = "#home";
                return "<h1>Logout successful</h1>";
            }
            catch (error) {
                console.error("Error during logout:", error);
                return "<h1>Logout failed</h1>";
            }
        });
    }
}
