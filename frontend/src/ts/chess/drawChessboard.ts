import { Chessboard } from './chessboardClass.js';
import { canvas } from './state.js'

const pieceImages: { [key: string]: HTMLImageElement } = {};

function getCSSColor(varName: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

function resizeCanvas() {

	const rect = canvas!.getBoundingClientRect();
	const dpr = window.devicePixelRatio || 1;

	canvas!.width = Math.round(rect.width * dpr);
	canvas!.height = Math.round(rect.height * dpr);

	const ctx = canvas!.getContext("2d")!;
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.scale(dpr, dpr);
}

function drawBoard(board: Chessboard, selectedSquares: Set<string> | null) {

	const ctx = canvas!.getContext("2d")!;
	const squareSize = canvas!.clientWidth / 8;

	const fsRow = board.lastMoveFrom ? parseInt(board.lastMoveFrom[0]) : null;
	const fsCol = board.lastMoveFrom ? parseInt(board.lastMoveFrom[1]) : null;
	const tsRow = board.lastMoveTo ? parseInt(board.lastMoveTo[0]) : null;
	const tsCol = board.lastMoveTo ? parseInt(board.lastMoveTo[1]) : null;

	const logicToVisualRow = (r: number | null) => r === null ? null : (board.playerColorView === "white" ? r : 7 - r);
	const logicToVisualCol = (c: number | null) => c === null ? null : (board.playerColorView === "white" ? c : 7 - c);

	ctx.font = `bold ${squareSize / 5}px Arial`;
	ctx.clearRect(0, 0, canvas!.clientWidth, canvas!.clientHeight);
	for (let row = 0; row < 8; row++) {
		for (let col = 0; col < 8; col++) {
			const isLight = (row + col) % 2 === 0;
			if (selectedSquares && selectedSquares.has(`${row}${col}`))
				ctx.fillStyle = isLight ? getCSSColor('--color-chilean-fire-300') : getCSSColor('--color-chilean-fire-500');
				// ctx.fillStyle = isLight ? "rgb(255, 139, 139)var" : "rgb(253, 103, 103)";
			else if ((logicToVisualCol(fsCol) === col && logicToVisualRow(fsRow) === row) || (logicToVisualCol(tsCol) === col && logicToVisualRow(tsRow) === row)) {
				// ctx.fillStyle = "rgb(154, 234, 236)";
				ctx.fillStyle = getCSSColor('--color-chilean-fire-300') ;
			}
			else
				ctx.fillStyle = isLight ? getCSSColor('--color-chilean-fire-100') : getCSSColor('--color-candlelight-800');

				// ctx.fillStyle = isLight ? "rgb(255, 255, 255)" : "rgb(67, 128, 183)";
			ctx.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);
			if (col === 0) {
				const number = board.playerColorView === "white" ? 8 - row : row + 1;
				ctx.textBaseline = "top";	
				ctx.textAlign = "left";
	  			ctx.fillStyle = isLight ? getCSSColor('--color-candlelight-800') : getCSSColor('--color-chilean-fire-100');
				// ctx.fillStyle = isLight ? "rgb(67, 128, 183)" : "rgb(255, 255, 255)";
				ctx.fillText(number.toString(), col * squareSize + 4, row * squareSize + 4);
			}
			if (row === 7) {
				const letter = board.playerColorView === "white" ? String.fromCharCode(97 + col) : String.fromCharCode(97 + (7 - col));
				ctx.textBaseline = "bottom";
				ctx.textAlign = "right";
				ctx.fillStyle = isLight ? getCSSColor('--color-candlelight-800') : getCSSColor('--color-chilean-fire-100');
				// ctx.fillStyle = isLight ? "rgb(67, 128, 183)" : "rgb(255, 255, 255)";
				ctx.fillText(letter.toString(), (col + 1) * squareSize - 4, (row + 1) * squareSize - 4);
			}
		}
	}
}

export function preloadImages(callback: () => void) {

	const pieces = ["wr", "wn", "wb", "wq", "wk", "wp", "br", "bn", "bb", "bq", "bk", "bp"]
	let loaded = 0;

	for (const piece of pieces) {
		const img = new Image();
		img.src = `../pieces/${piece}.png`;
		img.onload = () => {
			loaded++;
			if (loaded === pieces.length)
				callback();
		};
		pieceImages[piece] = img;
	}
}

function drawPieceAt(row: number, col: number, piece: string, playerColorView: string) {

	const ctx = canvas!.getContext("2d")!;
	ctx.imageSmoothingEnabled = true;

	const squareSize = canvas!.clientWidth / 8;

	const displayRow = playerColorView === "white" ? row : 7 - row;
	const displayCol = playerColorView === "white" ? col : 7 - col;

	const x = displayCol * squareSize;
	const y = displayRow * squareSize;

	const image = pieceImages[piece];
	ctx.drawImage(image, x, y, squareSize, squareSize);
}

function drawPieces(board: Chessboard) {

	for (let row = 0; row < 8; row++) {
		for (let col = 0; col < 8; col++) {
			const piece = board.getPieceAt(`${row}${col}`);
			if (piece)
				drawPieceAt(row, col, piece, board.playerColorView);
		}
	}
}

export function drawMovingPiece(event: MouseEvent, piece: string) {

	const ctx = canvas!.getContext("2d")!;
	const rect = canvas!.getBoundingClientRect();

	const scaleX = canvas!.clientWidth / rect.width;
	const scaleY = canvas!.clientHeight / rect.height;
	const mouseX = (event.clientX - rect.left) * scaleX;
	const mouseY = (event.clientY - rect.top) * scaleY;

	const image = pieceImages[piece];
	const squareSize = canvas!.clientWidth / 8;

	ctx.drawImage(image, mouseX - squareSize / 2, mouseY - squareSize / 2, squareSize, squareSize);
}

export function highlightSquare(square: string) {

	const ctx = canvas!.getContext("2d")!;
	const squareSize = canvas!.clientWidth / 8;

	const squareCol = parseInt(square[1]);
	const squareRow = parseInt(square[0]);

	const squareX = squareCol * squareSize;
	const squareY = squareRow * squareSize;

	
	ctx.lineWidth = 4;
	ctx.strokeStyle = getCSSColor('--color-international-orange-800');
	// ctx.strokeStyle = "rgb(94, 101, 134)";
	ctx.strokeRect(squareX + 2, squareY + 2, squareSize - 4, squareSize - 4);
}

export function drawArrows(arrows: Map<string, [string, string]> | null) {

	if (!arrows) return;

	const ctx = canvas!.getContext("2d")!;
	const squareSize = canvas!.clientWidth / 8;

	for (const [, [fromSquare, toSquare]] of arrows) {

		// Get center of squares
		const fromX = parseInt(fromSquare[1]) * squareSize + squareSize / 2;
		const fromY = parseInt(fromSquare[0]) * squareSize + squareSize / 2;
		const toX = parseInt(toSquare[1]) * squareSize + squareSize / 2;
		const toY = parseInt(toSquare[0]) * squareSize + squareSize / 2;

		// Direction
		const dx = toX - fromX;
		const dy = toY - fromY;
		const length = Math.hypot(dx, dy);
		const unitX = dx / length;
		const unitY = dy / length;

		// Parameters
		const shortenStart = squareSize * 0.2;
		const headLength = squareSize * 0.5;
		const angle = Math.atan2(dy, dx);

		// Coordinates of the start of the line
		const startX = fromX + unitX * shortenStart;
		const startY = fromY + unitY * shortenStart;

		// Coordinates of the two rear points of the head
		const tipX = toX;
		const tipY = toY;

		const leftX = tipX - headLength * Math.cos(angle - Math.PI / 6);
		const leftY = tipY - headLength * Math.sin(angle - Math.PI / 6);
		const rightX = tipX - headLength * Math.cos(angle + Math.PI / 6);
		const rightY = tipY - headLength * Math.sin(angle + Math.PI / 6);

		// Midpoint of the base of the head triangle
		const baseX = (leftX + rightX) / 2;
		const baseY = (leftY + rightY) / 2;

		// Draw arrow body
		ctx.beginPath();
		ctx.moveTo(startX, startY);
		ctx.lineTo(baseX, baseY);
		// ctx.strokeStyle = "rgba(255, 191, 62, 0.7)";
		ctx.strokeStyle = getCSSColor('--color-international-orange-700');
		ctx.lineWidth = squareSize * 0.2;
		ctx.stroke();

		// Draw arrow head
		ctx.beginPath();
		ctx.moveTo(tipX, tipY);
		ctx.lineTo(leftX, leftY);
		ctx.lineTo(rightX, rightY);
		ctx.closePath();
		// ctx.fillStyle = "rgba(255, 191, 62, 0.7)";
		ctx.fillStyle = getCSSColor('--color-international-orange-600');
		ctx.fill();
	}
}

export function setupChessboard(board: Chessboard, selectedSquares: Set<string> | null, arrows: Map<string, [string, string]> | null) {

	resizeCanvas();
	drawBoard(board, selectedSquares);
	drawPieces(board);
	drawArrows(arrows);
}
