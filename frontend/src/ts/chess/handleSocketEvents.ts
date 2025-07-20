import { updateLobbyList } from "./lobby.js";
import { updateTime } from "./formatContent.js";
import { setupChessboard } from "./drawChessboard.js";
import { launchUI, launchGame } from "./launchGame.js";
import { socket, chessboard, setData } from "./state.js";
import { showPromotionOptions } from "./handlePromotion.js";

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
		console.log(data);
		setData(data);
		switch (data.type) {
			case 'info':
				if (data.inGame === false)
					launchUI();
				else
					launchGame(data);
				break;
			case 'lobby':
				updateLobbyList(data);
				break;
			case 'move':
				chessboard!.set(data);
				setupChessboard(chessboard!, null, null);
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
				break;
			case 'checkmate':
				chessboard!.set(data);
				setupChessboard(chessboard!, null, null);
				break;
			case 'stalemate':
				chessboard!.set(data);
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
