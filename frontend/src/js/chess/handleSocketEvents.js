var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { setupChessboard } from "./drawChessboard.js";
function handleSocketOpen(socket, userId) {
    socket.onopen = () => {
        const handshake = {
            type: 'handshake',
            message: ''
        };
        socket.send(JSON.stringify(handshake));
    };
}
function handleSocketMessage(socket, userId, chessboard, canvas) {
    socket.onmessage = (event) => __awaiter(this, void 0, void 0, function* () {
        const data = JSON.parse(event.data);
        if (data.type === 'move') {
            console.log("Entrando");
            if (data.return === 'true') {
                chessboard.movePiece(data.moveFrom, data.moveTo);
                setupChessboard(chessboard, canvas, null, null);
            }
            else {
                setupChessboard(chessboard, canvas, null, null);
            }
        }
    });
}
function handleSocketClose(socket, userId) {
    socket.onclose = (event) => {
        console.log(`CLIENT: Connection closed - Code: ${event.code}`);
    };
}
function handleSocketError(socket, userId) {
    socket.onerror = (event) => {
        console.error("CLIENT: WebSocket error:", event);
    };
}
export function handleSocketEvents(socket, userId, chessboard, canvas) {
    handleSocketOpen(socket, userId);
    handleSocketMessage(socket, userId, chessboard, canvas);
    handleSocketClose(socket, userId);
    handleSocketError(socket, userId);
}
