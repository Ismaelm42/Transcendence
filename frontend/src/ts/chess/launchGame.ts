import { handleEvents } from './handleEvents.js'
import { getLobbyHtml } from './handleFetchers.js'
import { loadNotation } from './loadAndUpdateDom.js'
import { formatChessGame } from './formatContent.js'
import { preloadImages, setupChessboard } from './drawChessboard.js'
import { requestLobbyList, sendGameConfig } from './handleSenders.js'
import { userId, appContainer, chessboard, setChessboard, setCanvas } from './state.js'

function getConfig(): any {

	const playerColor = (document.getElementById('color') as HTMLSelectElement).value;
	const timeControl = (document.getElementById('time') as HTMLSelectElement).value;
	const gameMode = (document.getElementById('mode') as HTMLSelectElement).value;
	const minRating = (document.getElementById('minRating') as HTMLSelectElement).value;
	const maxRating = (document.getElementById('maxRating') as HTMLSelectElement).value;

	let dataPlayerColor, dataTimeControl, dataGameMode, dataMinRating, dataMaxRating;
	dataPlayerColor = playerColor;
	dataTimeControl = timeControl;
	dataGameMode = gameMode;
	dataMinRating = (minRating === "any") ? -10000 : parseInt(minRating, 10);
	dataMaxRating = (maxRating === "any") ? 10000 : parseInt(maxRating, 10);

	const data = {
		userId: userId,
		playerColor: dataPlayerColor,
		timeControl: dataTimeControl,
		gameMode: dataGameMode,
		minRating: dataMinRating,
		maxRating: dataMaxRating,
	}
	return data;
}

export async function launchUI() {

	appContainer!.innerHTML = await getLobbyHtml();
	const start = document.getElementById('start-game') as HTMLButtonElement;
	const modeSelect = document.getElementById('mode') as HTMLSelectElement;
	const minRating = document.getElementById('minRating') as HTMLSelectElement;
	const maxRating = document.getElementById('maxRating') as HTMLSelectElement;

	function blockRatingBracket() {

		if (modeSelect.value === "local") {
			minRating.value = 'any';
			maxRating.value = 'any';
			minRating.disabled = true;
			maxRating.disabled = true;
		}
		else {
			minRating.disabled = false;
			maxRating.disabled = false;
		}
	}
	blockRatingBracket();
	requestLobbyList();
	modeSelect.addEventListener('change', () => blockRatingBracket());
	start.addEventListener('click', async () => {
		const data = getConfig();
		sendGameConfig(data);
	});

}

export async function launchGame(data: any) {

	appContainer!.innerHTML = await formatChessGame(data);
	loadNotation();
	setCanvas();
	setChessboard(data);

	preloadImages(() => {
		setupChessboard(chessboard!, null, null);
		handleEvents();
	});
}
