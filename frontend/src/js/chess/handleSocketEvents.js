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
import { socket, chessboard } from "./state.js";
function handleSocketOpen() {
    socket.onopen = () => {
        const handshake = {
            type: 'handshake',
            message: ''
        };
        socket.send(JSON.stringify(handshake));
    };
}
function handleSocketMessage() {
    socket.onmessage = (event) => __awaiter(this, void 0, void 0, function* () {
        const data = JSON.parse(event.data);
        console.log(data);
        if (data.type === 'config') {
        }
        else if (data.type === 'move') {
            if (data.return === 'true') {
                chessboard.movePiece(data.moveFrom, data.moveTo);
                setupChessboard(null, null);
            }
            else {
                setupChessboard(null, null);
            }
        }
    });
}
function handleSocketClose() {
    socket.onclose = (event) => {
        console.log(`CLIENT: Connection closed - Code: ${event.code}`);
    };
}
function handleSocketError() {
    socket.onerror = (event) => {
        console.error("CLIENT: WebSocket error:", event);
    };
}
export function handleSocketEvents() {
    handleSocketOpen();
    handleSocketMessage();
    handleSocketClose();
    handleSocketError();
}
