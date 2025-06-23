import { Chessboard } from "./chessboardClass.js";
import { setupChessboard } from "./drawChessboard.js";

function handleSocketOpen(socket: WebSocket, userId: string) {
	socket.onopen = () => {
		const handshake = {
			type: 'handshake',
			message: ''
		};
		socket.send(JSON.stringify(handshake));
	}
}

function handleSocketMessage(socket: WebSocket, userId: string, chessboard: Chessboard, canvas: HTMLCanvasElement) {

	socket.onmessage = async (event: MessageEvent) => {
		const data = JSON.parse(event.data);
		if (data.type === 'move') {
			console.log("Entrando")
			if (data.return === 'true') {
				chessboard.movePiece(data.moveFrom, data.moveTo);
				setupChessboard(chessboard, canvas, null, null);
			}
			else {
				setupChessboard(chessboard, canvas, null, null);
			}
		}
	}
}

function handleSocketClose(socket: WebSocket, userId: string) {
	socket.onclose = (event: CloseEvent) => {
		console.log(`CLIENT: Connection closed - Code: ${event.code}`);
	}
}

function handleSocketError(socket: WebSocket, userId: string) {
	socket.onerror = (event) => {
		console.error("CLIENT: WebSocket error:", event);
	}
}

export function handleSocketEvents(socket: WebSocket, userId: string, chessboard: Chessboard, canvas: HTMLCanvasElement) {

	handleSocketOpen(socket, userId);
	handleSocketMessage(socket, userId, chessboard, canvas);
	handleSocketClose(socket, userId);
	handleSocketError(socket, userId);
}
