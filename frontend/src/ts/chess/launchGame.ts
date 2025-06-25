import { handleEvents } from './handleEvents.js'
import { verifySocket } from './verifySocket.js'
import { Chessboard } from './chessboardClass.js'
import { handleSocketEvents } from '../chess/handleSocketEvents.js'
import { createCanvas, preloadImages, setupChessboard } from './drawChessboard.js'
import { getLaunchGameHtml, getChessHtml, getUserId } from './handleFetchers.js'


export function checkIfGameIsRunning() {

	return sessionStorage.getItem("chess") || "";
}

function initChessboard(): Chessboard {
	
	const chessboard = new Chessboard();
	chessboard.init();
	
	const color = (document.getElementById('color') as HTMLSelectElement).value;
	const time = (document.getElementById('time') as HTMLSelectElement).value;
	const mode = (document.getElementById('mode') as HTMLSelectElement).value;
	const minRating = (document.getElementById('minRating') as HTMLSelectElement).value;
	const maxRating = (document.getElementById('maxRating') as HTMLSelectElement).value;

	if (color === 'random') {
		const options = ['white', 'black'];
		const randomIndex = Math.floor(Math.random() * options.length);
		chessboard.color = options[randomIndex];
	}
	else {
		chessboard.color = color;
	}
	chessboard.time = time;
	chessboard.mode = mode;
	chessboard.minRating = parseInt(minRating, 10);
	chessboard.maxRating = parseInt(maxRating, 10);

	return chessboard;
}

export async function launchUI(socket: WebSocket, userId: string, game: string, appElement: HTMLElement) {

	appElement.innerHTML = await getLaunchGameHtml();
	const start = document.getElementById('start-game') as HTMLButtonElement;
	const modeContainer = document.getElementById('modeContainer') as HTMLDivElement;
	const modeSelect = document.getElementById('mode') as HTMLSelectElement;

	function toggleModeVisibility(modeContainer: HTMLDivElement, modeSelect: HTMLSelectElement) {
		if (modeSelect.value === 'online')
			modeContainer.classList.remove('hidden');
		else
			modeContainer.classList.add('hidden');
	}
	modeSelect.addEventListener('change', () => toggleModeVisibility(modeContainer, modeSelect));
	start.addEventListener('click', async () => await launchGame(socket, userId, game, appElement));
}

export async function launchGame(socket: WebSocket, userId: string, game: string, appElement: HTMLElement) {

		const chessboard = initChessboard();
		appElement.innerHTML = await getChessHtml();
		const board = document.getElementById("board") as HTMLDivElement;

		const canvas = createCanvas(board);
		preloadImages(()=>{
			setupChessboard(chessboard, canvas, null, null);
			handleEvents(socket!, userId, chessboard, canvas);
			handleSocketEvents(socket!, userId, chessboard, canvas);
		});
}
