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
    render(appElement) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("En login render");
            try {
                const response = yield fetch("../html/login.html");
                if (!response.ok)
                    throw new Error("Failed to load the HTML file");
                const htmlContent = yield response.text();
                if (this.container && htmlContent) {
                    this.container.innerHTML = htmlContent;
                    // Esperar un breve tiempo antes de asignar eventos
                    requestAnimationFrame(() => __awaiter(this, void 0, void 0, function* () {
                        const form = this.container.querySelector("form");
                        if (form) {
                            try {
                                const { handleLoginSubmit } = yield import('./handleLoginSubmit.js');
                                form.addEventListener("submit", (event) => __awaiter(this, void 0, void 0, function* () {
                                    event.preventDefault();
                                    console.log("Se ha pulsado handleLoginSubmit:", event);
                                    handleLoginSubmit(event);
                                }));
                            }
                            catch (err) {
                                console.error("Error al importar handleLoginSubmit.js:", err);
                            }
                        }
                    }));
                    appElement.innerHTML = htmlContent;
                }
            }
            catch (error) {
                console.error("Error al renderizar la página de login:", error);
                appElement.innerHTML = `<div id="pong-container">Ocurrió un error al generar el contenido</div>`;
            }
        });
    }
    renderHeader(headerElement) {
        return __awaiter(this, void 0, void 0, function* () {
            headerElement.innerHTML = `
				<div id="authButtons" class="flex items-center">
					<a href="#register" class="text-white hover:text-gray-400 ml-2">Register</a>
				</div>
			`;
        });
    }
}
