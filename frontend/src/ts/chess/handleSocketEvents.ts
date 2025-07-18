import { setupChessboard } from "./drawChessboard.js";
import { launchUI, launchGame } from "./launchGame.js";
import { updateLobbyList } from "./lobby.js";
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
			case 'promote':
				setupChessboard(chessboard!, null, null);
				showPromotionOptions();
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
