import { handleEvents } from './handleEvents.js'
import { sendGameConfig } from './handleSenders.js'
import { getConfigHtml, getChessHtml } from './handleFetchers.js'
import { preloadImages, setupChessboard } from './drawChessboard.js'
import { userId, appContainer, chessboard, setChessboard, setCanvas } from './state.js'


export function checkIfGameIsRunning() {

	return sessionStorage.getItem("chessboard") || "";
}

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

async function launchConfig() {

	appContainer!.innerHTML = await getConfigHtml();
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
	start.addEventListener('click', async () =>{
		const data = getConfig();
		sendGameConfig(data);

		await launchGame(data)
	});

}

async function launchLobby() {

}

export async function launchUI() {

	await launchConfig();
	await launchLobby();
}

export async function launchGame(data: any) {

	appContainer!.innerHTML = await getChessHtml();
	setCanvas();
	setChessboard(data);

	preloadImages(()=>{
		setupChessboard(chessboard!, null, null);
		handleEvents();
	});
}
