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
import { verifySocket } from './verifySocket.js';
import { checkIfGameIsRunning, launchGame, launchUI } from './launchGame.js';
import { getUserId } from './handleFetchers.js';
export default class Chess extends Step {
    render(appElement) {
        return __awaiter(this, void 0, void 0, function* () {
            sessionStorage.setItem("current-view", "Chess");
            if (!this.username) {
                this.username = yield this.checkAuth();
            }
            try {
                const socket = verifySocket(Step.socket);
                const userId = yield getUserId(this.username);
                const game = checkIfGameIsRunning();
                if (!game)
                    launchUI(socket, userId, game, appElement);
                else
                    launchGame(socket, userId, game, appElement);
            }
            catch (error) {
                console.log(error);
                appElement.innerHTML = `<div id="pong-container">An error occurred while generating the content</div>`;
            }
        });
    }
}
// Verificación de socket
// Obtener el ID
// Verificar session.storage
/////////// Si no hay una sesión de juego, abrir el menu y función para crear el chessboard y gestionar el juego (lo de gestionar el juego debe ser una función que se lance en el eventListener del clic del menú)
/////////// Si hay una sesión de juego abierta, función para crear el chessboard y gestionar el juego
// Gestionar la construcción del tablero
