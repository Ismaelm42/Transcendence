import { updateLobbyList } from './lobby.js';
import { updateTime, flipSideBar } from './formatContent.js';
import { setupChessboard } from './drawChessboard.js';
import { launchUI, launchGame } from './launchGame.js';
import { socket, chessboard, setData } from './state.js';
import { updateOrInsertNotation } from './formatContent.js';
import { saveStatusGame, deleteNotation } from './loadAndUpdateDom.js';
import { showPromotionOptions, showGameOverOptions, showRequestRematchOptions, showResponseRematchDeclined } from './handleModals.js'

function handleSocketOpen() {

	socket!.onopen = () => {
		const handshake = {
			type: 'handshake',
			message: ''
		};
		socket!.send(JSON.stringify(handshake));
	}
}

function handleSocketMessage() {

	socket!.onmessage = async (event: MessageEvent) => {
		const data = JSON.parse(event.data);
		if (data.type != 'time') {
			setData(data);
			console.log(data);
		}
		switch (data.type) {
			case 'info':
				if (data.inGame === false)
					launchUI();
				else {
					if (data.isNewGame) {
						saveStatusGame('inGame');
						deleteNotation();
					}
					launchGame(data);
				}
				break;
			case 'lobby':
				updateLobbyList(data);
				break;
			case 'move':
				chessboard!.set(data);
				setupChessboard(chessboard!, null, null);
				updateOrInsertNotation(data.move, data.color, data.notation);
				break;
			case 'time':
				updateTime(data);
				break;
			case 'promote':
				setupChessboard(chessboard!, null, null);
				showPromotionOptions();
				break;
			case 'check':
				chessboard!.set(data);
				setupChessboard(chessboard!, null, null);
				updateOrInsertNotation(data.move, data.color, data.notation);
				break;
			case 'checkmate':
				chessboard!.set(data);
				setupChessboard(chessboard!, null, null);
				updateOrInsertNotation(data.move, data.color, data.notation);
				showGameOverOptions(data);
				saveStatusGame('hasEnded');
				break;
			case 'stalemate':
				chessboard!.set(data);
				setupChessboard(chessboard!, null, null);
				updateOrInsertNotation(data.move, data.color, data.notation);
				showGameOverOptions(data);
				saveStatusGame('hasEnded');
				break;
			case 'timeout':
				showGameOverOptions(data);
				saveStatusGame('hasEnded');
				break;
			case 'requestRematch':
				showRequestRematchOptions(data);
				break;
			case 'cancelRematch':
				showResponseRematchDeclined(data);
				break;
			case 'flip':
				chessboard!.set(data);
				flipSideBar(data);
				setupChessboard(chessboard!, null, null);
				break;
		}
	}
}

function handleSocketClose() {
	socket!.onclose = (event: CloseEvent) => {
		console.log(`CLIENT: Connection closed - Code: ${event.code}`);
	}
}

function handleSocketError() {
	socket!.onerror = (event) => {
		console.error("CLIENT: WebSocket error:", event);
	}
}

export function handleSocketEvents() {

	handleSocketOpen();
	handleSocketMessage();
	handleSocketClose();
	handleSocketError();
}
