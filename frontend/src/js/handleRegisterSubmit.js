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
export function handleRegisterSubmit(event) {
    return __awaiter(this, void 0, void 0, function* () {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        console.log("Datos del formulario de registro:", data);
        console.log("data.password: =", data.password);
        console.log("data.confirm_password: ", data.confirm_password);
        if (data.password !== data.confirm_password) {
            alert("Las contraseñas no coinciden. Por favor, verifica e intenta nuevamente.");
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
            if (!response.ok)
                if (response.status === 409) {
                    alert("El nombre de usuario o el correo ya existe. Por favor, elige otro.");
                }
                else if (response.status === 500) {
                    alert("Error interno del servidor. Por favor, inténtalo más tarde.");
                }
                else if (response.status === 400) {
                    alert("Error en la solicitud. Por favor, verifica los datos ingresados.");
                }
                else {
                    alert("Error desconocido. Por favor, inténtalo más tarde.");
                }
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
        catch (error) {
            console.error("Error al enviar el formulario de registro:", error);
            console.error("Error en el registro o login:", error);
            return "Error al enviar el formulario de registro o username ya existente";
        }
    });
}
