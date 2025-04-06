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
export default class Stats extends Step {
    render() {
        return __awaiter(this, void 0, void 0, function* () {
            const menuContainer = document.getElementById("menu-container");
            try {
                console.log("En Stats Step render");
                const user = yield this.checkAuth();
                if (user) {
                    // Retornar el contenido para usuarios autenticados
                    return `
						<div class="flex-grow flex flex-col items-center justify-center ">
		   					<h1 class="text-4xl font-bold text-gray-800">Stats Step</h1>
						</div>
				`;
                }
                else {
                    // Retornar el contenido para usuarios no autenticados
                    return `
						<div id="pong-container">
							<div class="paddle left-paddle"></div>
							<div class="ball"><img src="../img/bola.png" alt="Ball"></div>
							<div class="paddle right-paddle"></div>
						</div>
					`;
                }
            }
            catch (error) {
                console.error("Error en render:", error);
                return `<div id="pong-container">Ocurrió un error al generar el contenido</div>`;
            }
        });
    }
}
