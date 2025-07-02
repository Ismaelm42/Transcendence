import { setupChessboard } from "./drawChessboard.js";
import { socket, chessboard } from "./state.js";

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
		if (data.type === 'config') {
		}
		else if (data.type === 'move') {
			if (data.return === 'true') {
				chessboard!.movePiece(data.moveFrom, data.moveTo);
				setupChessboard(null, null);
			}
			else {
				setupChessboard(null, null);
			}
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
