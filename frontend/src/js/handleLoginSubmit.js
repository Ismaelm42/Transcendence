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
import { showMessage } from './showMessage.js';
export function handleLoginSubmit(event) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("handleLoginSubmit:", event);
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
                showMessage(`Error: ${errorResponse.message}`, null);
            }
            else {
                const result = yield response.json();
                console.log("Login exitoso:", result);
                const app = SPA.getInstance();
                app.navigate("home");
            }
        }
        catch (error) {
            console.error("Error al enviar el formulario de login:", error);
        }
    });
}
