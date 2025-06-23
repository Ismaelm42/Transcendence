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
import { showMessage } from '../modal/showMessage.js';
export default class RegisterRender extends Step {
    render(appElement) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.checkAuth();
            console.log("En login render");
            if (user) {
                showMessage("Usuario autenticado, redirigiendo a perfil", 3000);
                window.location.hash = "#home";
            }
            else {
                try {
                    const response = yield fetch("../../html/login/register.html");
                    if (!response.ok)
                        throw new Error("Failed to load the HTML file");
                    const htmlContent = yield response.text();
                    history.pushState(null, '', '/#register');
                    requestAnimationFrame(() => __awaiter(this, void 0, void 0, function* () {
                        const form = this.container.querySelector("form");
                        if (form) {
                            try {
                                const { handleRegisterSubmit } = yield import('./handleRegisterSubmit.js');
                                form === null || form === void 0 ? void 0 : form.addEventListener("submit", (event) => __awaiter(this, void 0, void 0, function* () {
                                    event.preventDefault();
                                    // console.log("Se ha pulsado handleRegisterSubmit:", event);
                                    handleRegisterSubmit(event);
                                }));
                            }
                            catch (err) {
                                console.error("Error al importar handleRegisterSubmit.js:", err);
                            }
                        }
                    }));
                    appElement.innerHTML = htmlContent;
                }
                catch (err) {
                    console.error("Error in render method:", err);
                    appElement.innerHTML = `<div id="pong-container">Ocurrió un error al generar el contenido</div>`;
                }
            }
        });
    }
    renderHeader(headerElement) {
        return __awaiter(this, void 0, void 0, function* () {
            headerElement.innerHTML = `
			<div id="authButtons" class="flex items-center">
				<a href="#login" class="text-white hover:text-gray-400">Login</a>
			</div>`;
        });
    }
}
