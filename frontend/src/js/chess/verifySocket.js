export function verifySocket(chessSocket) {
    if (!chessSocket || chessSocket.readyState === WebSocket.CLOSED) {
        chessSocket = new WebSocket("https://localhost:8443/back/ws/chess");
    }
    return chessSocket;
}
