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
export class Step {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.spa = SPA.getInstance(); // Obtenemos la instancia de SPA
    }
    checkAuth() {
        return __awaiter(this, void 0, void 0, function* () {
            const validation = false;
            // Simulación de verificación de autenticación PARA CUANDO LA COOKIE NO SE ENVIA BIEN"
            if (validation) {
                const user = {
                    "username": "Pepe5@gmail.com",
                    "password": "1234",
                    "email": "Pepe5@gmail.com"
                };
                return user.username;
            }
            else {
                console.log("Verificando autenticación...");
                try {
                    const response = yield fetch("https://localhost:8443/back/auth/verify-token", {
                        method: "GET",
                        credentials: "include"
                    });
                    if (!response.ok)
                        return null;
                    const data = yield response.json();
                    return data.user.username; // Devuelve el nombre de usuario si está autenticado
                }
                catch (error) {
                    console.error("Error al verificar la autenticación:", error);
                    return null;
                }
            }
        });
    }
    render() {
        return __awaiter(this, void 0, void 0, function* () {
            return '<div>Contenido no definido</div>';
        });
    }
    renderHeader() {
        return __awaiter(this, void 0, void 0, function* () {
            return '';
        });
    }
    renderMenu() {
        return __awaiter(this, void 0, void 0, function* () {
            return '';
        });
    }
    navigate(step) {
        this.spa.navigate(step); // Usamos la instancia de SPA para navegar
    }
}
