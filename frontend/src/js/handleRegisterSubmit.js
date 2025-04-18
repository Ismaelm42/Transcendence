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
export function handleRegisterSubmit(event) {
    return __awaiter(this, void 0, void 0, function* () {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        if (data.password !== data.confirm_password) {
            showMessage("Passwords do not match. Please check and try again.", null);
            return;
        }
        try {
            const response = yield fetch("https://localhost:8443/back/register_user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const errorResponse = yield response.json();
                if (response.status === 409) {
                    showMessage(`Error: ` + errorResponse.error, null);
                }
                else if (response.status === 500) {
                    showMessage("Internal server error. Please try again later.", null);
                }
                else if (response.status === 400) {
                    showMessage("Bad request. Please check the entered data.", null);
                }
                else {
                    showMessage("Unknown error. Please try again later.", null);
                }
            }
            else {
                // ;
                // try
                // {
                // 	const result = await response.json();
                // 	console.log("Resultado del registro:", result);
                // } catch (error) {
                // 	console.error("Error al realizar el registro:", error);
                //     if (error instanceof Error) {
                //         alert("Error: " + error.message);
                //     } else {
                //         alert("Error: An unknown error occurred");
                //     }
                // }
                // Navegar a la página de inicio
                const app = SPA.getInstance();
                app.navigate("home");
            }
        }
        catch (error) {
            console.error("Error al enviar el formulario de registro:", error);
            console.error("Error en el registro o login:", error);
            return "Error al enviar el formulario de registro o username ya existente";
        }
    });
}
