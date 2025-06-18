import { Chessboard } from './chessboardClass.js'
import { setupChessboard } from './drawChessboard.js'

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
	console.log(`Square is: ${String.fromCharCode(97 + col)}${8 - row}`);
	return `${row}${col}`;
}

function movePiece(event: MouseEvent, square: string, piece: string, copy: Chessboard, canvas: HTMLCanvasElement) {

	copy.deletePiece(square);
	setupChessboard(copy, canvas);
	console.log("Aqui")
	
	
}

function dropPiece(event: MouseEvent) {

}

function activateMouseListeners(square: string, piece: string, copy: Chessboard, canvas: HTMLCanvasElement) {

	function mouseMoveHandler(event: MouseEvent) {
        movePiece(event, square, piece, copy, canvas);
    }
    function mouseUpHandler(event: MouseEvent) {
        dropPiece(event);
        window.removeEventListener("mousemove", mouseMoveHandler);
        window.removeEventListener("mouseup", mouseUpHandler);
    }

    // Usar las mismas referencias al agregar y quitar
    window.addEventListener("mousemove", mouseMoveHandler);
    window.addEventListener("mouseup", mouseUpHandler);
}


export function handleEvents(chessboard: Chessboard, canvas: HTMLCanvasElement) {

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
