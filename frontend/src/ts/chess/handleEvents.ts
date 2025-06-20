import { Chessboard } from './chessboardClass.js'
import { setupChessboard, drawMovingPiece, highlightSquare } from './drawChessboard.js'

let lastMoveFrom: string | null = null;
let lastMoveTo: string | null = null;
let selectedSquares = new Set<string>();
let arrows = new Map<string, [string, string]>();

function getSquare(event: MouseEvent, canvas: HTMLCanvasElement): string | null {

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

function movePiece(event: MouseEvent, fromSquare: string, piece: string, copy: Chessboard, canvas: HTMLCanvasElement) {

	const currentSquare = getSquare(event, canvas);
	copy.deletePiece(fromSquare);
	setupChessboard(copy, canvas, fromSquare, null, null, null);
	if (currentSquare) {
		highlightSquare(currentSquare, canvas);
	}
	drawMovingPiece(event, piece, canvas);
}

function dropPiece(event: MouseEvent, fromSquare: string, piece: string, chessboard: Chessboard, canvas: HTMLCanvasElement) {

	// If move is ok from backend, then
	// fromSquare and toSquare are always set here. But it should set it only if they are valids.
	// If fromSquare === toSquare, response is false from backend
	const response = true;

	const toSquare = getSquare(event, canvas);
	if (toSquare && response) {
		lastMoveFrom = fromSquare;
		lastMoveTo = toSquare;
		chessboard.movePiece(lastMoveFrom, lastMoveTo);
		setupChessboard(chessboard, canvas, lastMoveFrom, lastMoveTo, null, null);
	}
	else {
		setupChessboard(chessboard, canvas, lastMoveFrom, lastMoveTo, null, null);
	}
}

function handleLeftClick(fromSquare: string, piece: string, chessboard: Chessboard, canvas: HTMLCanvasElement) {

	function mouseMoveHandler(event: MouseEvent) {
        movePiece(event, fromSquare!, piece, chessboard.clone(), canvas);
    }
    function mouseUpHandler(event: MouseEvent) {
        dropPiece(event, fromSquare, piece, chessboard, canvas);
        window.removeEventListener("mousemove", mouseMoveHandler);
        window.removeEventListener("mouseup", mouseUpHandler);
    }
	function mouseRightClickHandler(event: MouseEvent) {
		setupChessboard(chessboard, canvas, lastMoveFrom, lastMoveTo, null, null);
		window.removeEventListener("mousemove", mouseMoveHandler);
        window.removeEventListener("mouseup", mouseUpHandler);
		window.removeEventListener("contextmenu", mouseRightClickHandler);
	}

    window.addEventListener("mousemove", mouseMoveHandler);
    window.addEventListener("mouseup", mouseUpHandler);
	window.addEventListener("contextmenu", mouseRightClickHandler);
}

function handleRightClick(fromSquare: string, chessboard: Chessboard, canvas: HTMLCanvasElement) {

	function mouseUpHandler(event: MouseEvent) {

		if (event.button !== 2) {
			return;
		}
		const toSquare = getSquare(event, canvas);
		if (fromSquare === toSquare) {
			if (selectedSquares.has(fromSquare)) {
				selectedSquares.delete(fromSquare);
			}
			else {
				selectedSquares.add(fromSquare);
			}
		}
		else {
			if (toSquare) {
				if (arrows.has(`${fromSquare}${toSquare}`)) {
					arrows.delete(`${fromSquare}${toSquare}`);
				}
				else {
					arrows.set(`${fromSquare}${toSquare}`, [fromSquare, toSquare]);
				}
			}
		}
		setupChessboard(chessboard, canvas, lastMoveFrom, lastMoveTo, selectedSquares, arrows);
		window.removeEventListener("mouseup", mouseUpHandler);
	}
	window.addEventListener("mouseup", mouseUpHandler);
}

export function handleEvents(chessboard: Chessboard, canvas: HTMLCanvasElement) {

	// To prevent right click context menu
	canvas.addEventListener("contextmenu", (event) => {
		event.preventDefault();
	});

	// Event listener to change style cursor
	canvas.addEventListener("mousemove", (event) => {
		const square = getSquare(event, canvas);
		if (square) {
			const piece = chessboard.getPieceAt(square);
			if (piece) {
				canvas.style.cursor = "pointer";
			} else {
				canvas.style.cursor = "default";
			}
		}
	});

	// Event listener to handle select and move a piece or select and highlight a square
	canvas.addEventListener("mousedown", (event) => {
		if (event.button === 0) {
			arrows.clear();
			if (selectedSquares) {
				selectedSquares.clear();
				setupChessboard(chessboard, canvas, lastMoveFrom, lastMoveTo, null, null);
			}
			const fromSquare = getSquare(event, canvas);
			if (fromSquare) {
				const piece = chessboard.getPieceAt(fromSquare);
				if (piece) {
					movePiece(event, fromSquare, piece, chessboard.clone(), canvas);
					handleLeftClick(fromSquare, piece, chessboard, canvas);
				}
			}
		}
		if (event.button === 2 && (event.buttons & 1) === 0) {
			const fromSquare = getSquare(event, canvas);
			if (fromSquare) {
				handleRightClick(fromSquare, chessboard, canvas);
			}
		}
	});
	
	// Event listener for resize window
	window.addEventListener("resize", () => {
		requestAnimationFrame(() => {
		setupChessboard(chessboard, canvas, lastMoveFrom, lastMoveTo, selectedSquares, arrows);
		});
	});
}
