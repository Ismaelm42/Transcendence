import { userId, socket } from './state.js';
export function waitForSocketOpen() {
    return new Promise(resolve => {
        if ((socket === null || socket === void 0 ? void 0 : socket.readyState) === WebSocket.OPEN)
            resolve();
        else {
            const interval = setInterval(() => {
                if ((socket === null || socket === void 0 ? void 0 : socket.readyState) === WebSocket.OPEN) {
                    clearInterval(interval);
                    resolve();
                }
            }, 50);
        }
    });
}
export function checkIfGameIsRunning() {
    const message = {
        type: 'info',
    };
    socket.send(JSON.stringify(message));
}
export function requestLobbyList() {
    const message = {
        type: 'lobby',
    };
    socket.send(JSON.stringify(message));
}
export function sendGameConfig(data) {
    const message = {
        type: 'config',
        userId: data.userId,
        playerColor: data.playerColor,
        timeControl: data.timeControl,
        gameMode: data.gameMode,
        minRating: data.minRating,
        maxRating: data.maxRating,
    };
    socket.send(JSON.stringify(message));
}
export function sendOptionSelected(id) {
    let message;
    if (userId === id) {
        message = {
            type: 'deleteLobby',
        };
    }
    else {
        message = {
            type: 'join',
            id: id,
        };
    }
    socket.send(JSON.stringify(message));
}
export function sendPieceMove(fromSquare, toSquare) {
    const message = {
        type: 'move',
        userId: userId,
        moveFrom: fromSquare,
        moveTo: toSquare,
    };
    socket.send(JSON.stringify(message));
}
export function promoteToPiece(fromSquare, toSquare, piece) {
    const message = {
        type: 'move',
        promoteTo: piece,
        userId: userId,
        moveFrom: fromSquare,
        moveTo: toSquare,
    };
    socket.send(JSON.stringify(message));
}
export function deleteGame() {
    const message = {
        type: 'delete',
    };
    socket.send(JSON.stringify(message));
}
export function requestRematch() {
    const message = {
        type: 'requestRematch',
    };
    socket.send(JSON.stringify(message));
}
export function acceptRematch() {
    const message = {
        type: 'rematch',
    };
    socket.send(JSON.stringify(message));
}
export function rejectRematch() {
    const message = {
        type: 'rejectRematch',
    };
    socket.send(JSON.stringify(message));
}
export function navigateReplay(step) {
    const message = {
        type: 'navigate',
        step: step,
    };
    socket.send(JSON.stringify(message));
}
export function flipBoard() {
    const message = {
        type: 'flip',
    };
    socket.send(JSON.stringify(message));
}
export function cancelGame() {
    const message = {
        type: 'cancel',
    };
    socket.send(JSON.stringify(message));
}
export function requestDraw() {
    const message = {
        type: 'requestDraw',
    };
    socket.send(JSON.stringify(message));
}
export function acceptDraw() {
    const message = {
        type: 'acceptDraw',
    };
    socket.send(JSON.stringify(message));
}
export function resign() {
    const message = {
        type: 'resign',
    };
    socket.send(JSON.stringify(message));
}
