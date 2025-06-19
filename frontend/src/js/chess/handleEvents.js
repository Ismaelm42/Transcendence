import { setupChessboard, drawMovingPiece, highlightSquare } from './drawChessboard.js';
let fromSquare = null;
let toSquare = null;
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
    // console.log(`Square is: ${String.fromCharCode(97 + col)}${8 - row}`);
    return `${row}${col}`;
}
function movePiece(event, fromSquare, piece, copy, canvas) {
    const currentSquare = getSquare(event, canvas);
    copy.deletePiece(fromSquare);
    setupChessboard(copy, canvas, fromSquare, null);
    if (currentSquare) {
        highlightSquare(currentSquare, canvas);
    }
    drawMovingPiece(event, piece, canvas);
}
function dropPiece(event, piece, chessboard, canvas) {
    // if move is ok from backend, then
    toSquare = getSquare(event, canvas);
    if (toSquare) {
        chessboard.movePiece(fromSquare, toSquare);
        console.log("chessboard.move", chessboard.move);
        setupChessboard(chessboard, canvas, fromSquare, toSquare);
    }
    else {
        setupChessboard(chessboard, canvas, null, null);
    }
}
function activateMouseListeners(piece, chessboard, canvas) {
    function mouseMoveHandler(event) {
        movePiece(event, fromSquare, piece, chessboard.clone(), canvas);
    }
    function mouseUpHandler(event) {
        dropPiece(event, piece, chessboard, canvas);
        window.removeEventListener("mousemove", mouseMoveHandler);
        window.removeEventListener("mouseup", mouseUpHandler);
    }
    window.addEventListener("mousemove", mouseMoveHandler);
    window.addEventListener("mouseup", mouseUpHandler);
}
export function handleEvents(chessboard, canvas) {
    // Event listener to change style cursor
    canvas.addEventListener("mousemove", (event) => {
        const square = getSquare(event, canvas);
        if (square) {
            const piece = chessboard.getPieceAt(square);
            if (piece) {
                canvas.style.cursor = "pointer";
            }
            else {
                canvas.style.cursor = "default";
            }
        }
    });
    // Event listener to handle moving a piece
    canvas.addEventListener("mousedown", (event) => {
        fromSquare = getSquare(event, canvas);
        if (fromSquare) {
            const piece = chessboard.getPieceAt(fromSquare);
            if (piece) {
                movePiece(event, fromSquare, piece, chessboard.clone(), canvas);
                activateMouseListeners(piece, chessboard, canvas);
            }
        }
    });
    // Event listener for resize window
    window.addEventListener("resize", () => {
        requestAnimationFrame(() => {
            setupChessboard(chessboard, canvas, fromSquare, toSquare);
        });
    });
}
