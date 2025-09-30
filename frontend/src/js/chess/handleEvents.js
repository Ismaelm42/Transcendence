import { launchUI } from './launchGame.js';
import { chessboard, canvas, data } from './state.js';
import { deleteNotation } from './loadAndUpdateDom.js';
import { setupChessboard, drawMovingPiece, highlightSquare } from './drawChessboard.js';
import { sendPieceMove, promoteToPiece, deleteGame, requestRematch, acceptRematch, rejectRematch, navigateReplay, flipBoard, cancelGame, requestDraw, acceptDraw, resign } from './handleSenders.js';
import { hidePromotionOptions, hideGameOverOptions, hideSidebarOverlay, hideRequestRematchOptions, showRequestRematchWaiting, hideResponseRematchDeclined, hideConfirmationDraw, showConfirmationDraw, hideConfirmationResign, showConfirmationResign, hideRequestDrawOptions } from './handleModals.js';
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
function dropPiece(event, fromSquare) {
    const toSquare = getSquare(chessboard.playerColorView, event);
    if (toSquare)
        sendPieceMove(fromSquare, toSquare);
    else
        setupChessboard(chessboard, null, null);
}
function handleLeftClick(fromSquare, piece) {
    function mouseMoveHandler(event) {
        movePiece(event, fromSquare, piece, chessboard.clone());
    }
    function mouseUpHandler(event) {
        dropPiece(event, fromSquare);
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
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
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
    // Event listener to handle promotion
    (_a = document.getElementById("modal-promotion")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", (event) => {
        const target = event.target;
        if (target.id === 'close-promotion')
            hidePromotionOptions();
        else if (target.id === 'q' || target.id === 'r' || target.id === 'b' || target.id === 'n') {
            const piece = target.id;
            hidePromotionOptions();
            promoteToPiece(data.moveFrom, data.moveTo, piece);
        }
    });
    // Event listener to handle game over
    (_b = document.getElementById("modal-game-over")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", (event) => {
        const target = event.target;
        if (target.id === 'close-game-over' || target.id === 'game-review') {
            hideGameOverOptions();
            hideSidebarOverlay();
        }
        else if (target.id === 'rematch') {
            hideGameOverOptions();
            showRequestRematchWaiting();
            requestRematch();
        }
        else if (target.id === 'go-to-lobby') {
            deleteNotation();
            deleteGame();
            launchUI();
        }
    });
    // Event listener to respond rematch request
    (_c = document.getElementById("modal-rematch")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", (event) => {
        const target = event.target;
        if (target.id === 'yes') {
            acceptRematch();
            hideRequestRematchOptions();
        }
        else if (target.id === 'no') {
            rejectRematch();
            hideRequestRematchOptions();
            hideSidebarOverlay();
        }
    });
    // Event listener to respond rematch decline
    (_d = document.getElementById("modal-rematch-declined")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", (event) => {
        const target = event.target;
        if (target.id === 'close-rematch-declined') {
            hideResponseRematchDeclined();
            hideSidebarOverlay();
        }
    });
    // Event listener to handle buttons
    (_e = document.getElementById("action-buttons")) === null || _e === void 0 ? void 0 : _e.addEventListener("click", (event) => {
        const target = event.target;
        if (target.id === 'first')
            navigateReplay("first");
        else if (target.id === 'previous')
            navigateReplay("previous");
        else if (target.id === 'next')
            navigateReplay("next");
        else if (target.id === 'last')
            navigateReplay("last");
        else if (target.id === 'flip')
            flipBoard();
    });
    // Event listener to handle game options
    (_f = document.getElementById("game-options")) === null || _f === void 0 ? void 0 : _f.addEventListener("click", (event) => {
        const target = event.target;
        if (target.id === 'draw')
            showConfirmationDraw();
        if (target.id === 'resign')
            showConfirmationResign();
        if (target.id === 'return') {
            deleteNotation();
            deleteGame();
            launchUI();
            cancelGame();
        }
    });
    //Event listener to handle draw confirmation
    (_g = document.getElementById("modal-confirmDraw")) === null || _g === void 0 ? void 0 : _g.addEventListener("click", (event) => {
        const target = event.target;
        if (target.id === 'yes') {
            hideRequestDrawOptions();
            hideConfirmationResign();
            hideConfirmationDraw();
            requestDraw();
        }
        if (target.id === 'no') {
            hideRequestDrawOptions();
            hideConfirmationResign();
            hideConfirmationDraw();
        }
    });
    //Event listener to handle resign confirmation
    (_h = document.getElementById("modal-confirmResign")) === null || _h === void 0 ? void 0 : _h.addEventListener("click", (event) => {
        const target = event.target;
        if (target.id === 'yes') {
            hideRequestDrawOptions();
            hideConfirmationDraw();
            hideConfirmationResign();
            resign();
        }
        if (target.id === 'no') {
            hideRequestDrawOptions();
            hideConfirmationDraw();
            hideConfirmationResign();
        }
    });
    //Event listener to handle draw request
    (_j = document.getElementById("modal-requestDraw")) === null || _j === void 0 ? void 0 : _j.addEventListener("click", (event) => {
        const target = event.target;
        if (target.id === 'yes') {
            hideRequestDrawOptions();
            hideConfirmationDraw();
            hideConfirmationResign();
            acceptDraw();
        }
        if (target.id === 'no') {
            hideRequestDrawOptions();
            hideConfirmationDraw();
            hideConfirmationResign();
        }
    });
    // Event listener for resize window
    window.addEventListener("resize", () => {
        requestAnimationFrame(() => {
            setupChessboard(chessboard, selectedSquares, arrows);
        });
    });
}
