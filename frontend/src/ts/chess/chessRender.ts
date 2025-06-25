import { Step } from '../spa/stepRender.js'
import { handleEvents } from './handleEvents.js'
import { verifySocket } from './verifySocket.js'
import { Chessboard } from './chessboardClass.js'
import { checkIfGameIsRunning, launchGame, launchUI } from './launchGame.js'
import { handleSocketEvents } from '../chess/handleSocketEvents.js'
import { getLaunchGameHtml, getChessHtml, getUserId } from './handleFetchers.js'
import { createCanvas, preloadImages, setupChessboard } from './drawChessboard.js'

export default class Chess extends Step {

	async render(appElement: HTMLElement): Promise<void> {
		sessionStorage.setItem("current-view", "Chess");
		if (!this.username) {
			this.username = await this.checkAuth();
		}
		try {
			const socket = verifySocket(Step.socket);
			const userId = await getUserId(this.username!);
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
	}
}


// Verificación de socket
// Obtener el ID
// Verificar session.storage
/////////// Si no hay una sesión de juego, abrir el menu y función para crear el chessboard y gestionar el juego (lo de gestionar el juego debe ser una función que se lance en el eventListener del clic del menú)
/////////// Si hay una sesión de juego abierta, función para crear el chessboard y gestionar el juego
// Gestionar la construcción del tablero
