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
export default class Home extends Step {
    render(appElement) {
        return __awaiter(this, void 0, void 0, function* () {
            const menuContainer = document.getElementById("menu-container");
            try {
                const user = yield this.checkAuth();
                console.log('En Home user despues de checkAuth: ' + user);
                if (user) {
                    // Retornar el contenido para usuarios autenticados
                    appElement.innerHTML = `
				<div id="pong-container">
					<div class="paddle left-paddle"></div>
					<h2>Bienvenido, ${user}!</h2>
					<div class="paddle right-paddle"></div>
				</div>
			`;
                }
                else {
                    appElement.innerHTML = `
					<div id="pong-container">
						<div class="paddle left-paddle"></div>
						<div class="ball"><img src="../img/bola.png" alt="Ball"></div>
						<div class="paddle right-paddle"></div>
					</div>
				`;
                }
            }
            catch (error) {
                appElement.innerHTML = `<div id="pong-container">Ocurrió un error al generar el contenido</div>`;
            }
        });
    }
}
