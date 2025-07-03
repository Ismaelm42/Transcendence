import { chessboard, canvas } from './state.js';
import { sendPieceMove } from './handleSenders.js';
import { setupChessboard, drawMovingPiece, highlightSquare } from './drawChessboard.js';
let selectedSquares = new Set();
let arrows = new Map();
function getSquare(playerColorView, event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    const squareSize = canvas.width / 8;
    let col = Math.floor(x / squareSize);
    let row = Math.floor(y / squareSize);
    if (col < 0 || col > 7 || row < 0 || row > 7)
        return null;
    if (playerColorView === "black") {
        row = 7 - row;
        col = 7 - col;
    }
    return `${row}${col}`;
}
function movePiece(event, fromSquare, piece, copy) {
    const currentSquare = getSquare("white", event);
    copy.deletePiece(fromSquare);
    copy.setLastMoves(fromSquare, null);
    setupChessboard(copy, null, null);
    if (currentSquare)
        highlightSquare(currentSquare);
    drawMovingPiece(event, piece);
}
// If move is ok from backend, then
// fromSquare and toSquare are always set here. But it should set it only if they are valids.
// If fromSquare === toSquare, response is false from backend
function dropPiece(event, fromSquare, piece) {
    const toSquare = getSquare(chessboard.playerColorView, event);
    if (toSquare)
        sendPieceMove(fromSquare, toSquare, piece);
}
function handleLeftClick(fromSquare, piece) {
    function mouseMoveHandler(event) {
        movePiece(event, fromSquare, piece, chessboard.clone());
    }
    function mouseUpHandler(event) {
        dropPiece(event, fromSquare, piece);
        window.removeEventListener("mousemove", mouseMoveHandler);
        window.removeEventListener("mouseup", mouseUpHandler);
    }
    function mouseRightClickHandler(event) {
        setupChessboard(chessboard, null, null);
        window.removeEventListener("mousemove", mouseMoveHandler);
        window.removeEventListener("mouseup", mouseUpHandler);
        window.removeEventListener("contextmenu", mouseRightClickHandler);
    }
    window.addEventListener("mousemove", mouseMoveHandler);
    window.addEventListener("mouseup", mouseUpHandler);
    window.addEventListener("contextmenu", mouseRightClickHandler);
}
function handleRightClick(fromSquare) {
    function mouseUpHandler(event) {
        if (event.button !== 2)
            return;
        const toSquare = getSquare("white", event);
        if (fromSquare === toSquare) {
            if (selectedSquares.has(fromSquare))
                selectedSquares.delete(fromSquare);
            else
                selectedSquares.add(fromSquare);
        }
        else {
            if (toSquare) {
                if (arrows.has(`${fromSquare}${toSquare}`))
                    arrows.delete(`${fromSquare}${toSquare}`);
                else
                    arrows.set(`${fromSquare}${toSquare}`, [fromSquare, toSquare]);
            }
        }
        setupChessboard(chessboard, selectedSquares, arrows);
        window.removeEventListener("mouseup", mouseUpHandler);
    }
    window.addEventListener("mouseup", mouseUpHandler);
}
export function handleEvents() {
    // To prevent right click context menu
    canvas.addEventListener("contextmenu", (event) => {
        event.preventDefault();
    });
    // Event listener to change style cursor
    canvas.addEventListener("mousemove", (event) => {
        const square = getSquare(chessboard.playerColorView, event);
        if (square) {
            const piece = chessboard.getPieceAt(square);
            if (piece)
                canvas.style.cursor = "pointer";
            else
                canvas.style.cursor = "default";
        }
    });
    // Event listener to handle select and move a piece or select and highlight a square
    canvas.addEventListener("mousedown", (event) => {
        if (event.button === 0) {
            arrows.clear();
            if (selectedSquares) {
                selectedSquares.clear();
                setupChessboard(chessboard, null, null);
            }
            const fromSquare = getSquare(chessboard.playerColorView, event);
            if (fromSquare) {
                const piece = chessboard.getPieceAt(fromSquare);
                if (piece) {
                    movePiece(event, fromSquare, piece, chessboard.clone());
                    handleLeftClick(fromSquare, piece);
                }
            }
        }
        if (event.button === 2 && (event.buttons & 1) === 0) {
            const fromSquare = getSquare("white", event);
            if (fromSquare)
                handleRightClick(fromSquare);
        }
    });
    // Event listener for resize window
    window.addEventListener("resize", () => {
        requestAnimationFrame(() => {
            setupChessboard(chessboard, selectedSquares, arrows);
        });
    });
}
