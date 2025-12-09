import { updateLobbyList } from './lobby.js';
import { setupChessboard } from './drawChessboard.js';
import { launchUI, launchGame } from './launchGame.js';
import { socket, chessboard, setData } from './state.js';
import { saveStatusGame, deleteNotation } from './loadAndUpdateDom.js';
import { updateTime, updateOrInsertNotation, flipSideBar, handleNavigation, notificationSound } from './formatContent.js';
import { showPromotionOptions, showGameOverOptions, showRequestRematchOptions, showResponseRematchDeclined, showRequestDrawOptions } from './handleModals.js'

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
		}
		switch (data.type) {
			case 'info':
				if (data.inGame === false)
					launchUI();
				else {
					if (data.isNewGame) {
						saveStatusGame('inGame');
						deleteNotation();
						notificationSound('start');
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
				if (data && data.notation) {
					if (data.notation.includes('O'))
						notificationSound('castle');
					else if (data.notation.includes('x'))
						notificationSound('capture');
					else
						notificationSound('move');
				}
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
				notificationSound('check');
				break;
			case 'checkmate':
				chessboard!.set(data);
				setupChessboard(chessboard!, null, null);
				updateOrInsertNotation(data.move, data.color, data.notation);
				notificationSound('checkmate');
				showGameOverOptions(data);
				saveStatusGame('hasEnded');
				break;
			case 'stalemate':
				chessboard!.set(data);
				setupChessboard(chessboard!, null, null);
				updateOrInsertNotation(data.move, data.color, data.notation);
				notificationSound('stalemate');
				showGameOverOptions(data);
				saveStatusGame('hasEnded');
				break;
			case 'timeout':
				notificationSound('over');
				showGameOverOptions(data);
				saveStatusGame('hasEnded');
				break;
			case 'agreement':
				notificationSound('over');
				showGameOverOptions(data);
				saveStatusGame('hasEnded');
				break;
			case 'resignation':
				notificationSound('over');
				showGameOverOptions(data);
				saveStatusGame('hasEnded');
				break;
			case 'requestRematch':
				showRequestRematchOptions(data);
				break;
			case 'cancelRematch':
				showResponseRematchDeclined(data);
				break;
			case 'navigate':
				handleNavigation(data);
				chessboard!.set(data);
				setupChessboard(chessboard!, null, null);
				break;
			case 'flip':
				chessboard!.set(data);
				flipSideBar(data);
				setupChessboard(chessboard!, null, null);
				break;
			case 'requestDraw':
				showRequestDrawOptions(data);
				break;
		}
	}
}

function handleSocketClose() {
	socket!.onclose = (event: CloseEvent) => {
	}
}

function handleSocketError() {
	socket!.onerror = (event) => {
	}
}

export function handleSocketEvents() {

	handleSocketOpen();
	handleSocketMessage();
	handleSocketClose();
	handleSocketError();
}
