import { setupChessboard } from './drawChessboard.js';
function getSquare(event, canvas) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    const squareSize = canvas.width / 8;
    const col = Math.floor(x / squareSize);
    const row = Math.floor(y / squareSize);
    if (col < 0 || col > 7 || row < 0 || row > 7) {
        return null;
    }
    console.log(`Square is: ${String.fromCharCode(97 + col)}${8 - row}`);
    return `${row}${col}`;
}
function movePiece(event, square, piece, copy, canvas) {
    copy.deletePiece(square);
    setupChessboard(copy, canvas);
    console.log("Aqui");
}
function dropPiece(event) {
}
function activateMouseListeners(square, piece, copy, canvas) {
    function mouseMoveHandler(event) {
        movePiece(event, square, piece, copy, canvas);
    }
    function mouseUpHandler(event) {
        dropPiece(event);
        window.removeEventListener("mousemove", mouseMoveHandler);
        window.removeEventListener("mouseup", mouseUpHandler);
    }
    // Usar las mismas referencias al agregar y quitar
    window.addEventListener("mousemove", mouseMoveHandler);
    window.addEventListener("mouseup", mouseUpHandler);
}
export function handleEvents(chessboard, canvas) {
    canvas.addEventListener("mousedown", (event) => {
        const square = getSquare(event, canvas);
        if (square) {
            const piece = chessboard.getPieceAt(square);
            if (piece) {
                activateMouseListeners(square, piece, chessboard.clone(), canvas);
            }
        }
    });
    window.addEventListener("resize", () => {
        requestAnimationFrame(() => {
            setupChessboard(chessboard, canvas);
        });
    });
}
