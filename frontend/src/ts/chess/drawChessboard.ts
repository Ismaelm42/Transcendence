import { Chessboard } from './chessboardClass.js'

const pieceImages: { [key: string]: HTMLImageElement } = {};

export function createCanvas(board: HTMLDivElement): HTMLCanvasElement {

	const canvas = document.createElement("canvas");

	canvas.style.width = "100%";
	canvas.style.height = "100%";
	canvas.style.display = "block";
	board.insertBefore(canvas, board.firstChild);
	return canvas;
}

function resizeCanvas(canvas: HTMLCanvasElement) {

	const rect = canvas.getBoundingClientRect();
	const dpr = window.devicePixelRatio || 1;

	canvas.width = Math.round(rect.width * dpr);
	canvas.height = Math.round(rect.height * dpr);

	const ctx = canvas.getContext("2d")!;
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.scale(dpr, dpr);
}

function drawBoard(fromSquare: string | null, toSquare: string | null, canvas: HTMLCanvasElement) {

	const ctx = canvas.getContext("2d")!;
	const squareSize = canvas.clientWidth / 8;

	// To highlight last move
	const fsCol = fromSquare ? parseInt(fromSquare[1]) : null;
	const fsRow = fromSquare ? parseInt(fromSquare[0]) : null;
	const tsCol = toSquare ? parseInt(toSquare[1]) : null;
	const tsRow = toSquare ? parseInt(toSquare[0]) : null;

	ctx.font = `bold ${squareSize / 5}px Arial`;

	const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

	ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
	for (let row = 0; row < 8; row++) {
		for (let col = 0; col < 8; col++) {
			const isLight = (row + col) % 2 === 0;
			if ((fsCol === col && fsRow === row) || (tsCol === col && tsRow === row)) {
				console.log("HOLAAAA")
				ctx.fillStyle = "rgb(255, 139, 139)";
			}
			else {
				ctx.fillStyle = isLight ? "rgb(248, 250, 252)" : "rgb(67, 128, 183)";
			}
			ctx.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);
			if (col === 0) {
				const number = 8 - row;
				ctx.textBaseline = "top";
				ctx.textAlign = "left";
				ctx.fillStyle = isLight ? "#4380b7" : "#f8fafc";
				ctx.fillText(number.toString(), col * squareSize + 4, row * squareSize + 4);
			}
			if (row === 7) {
				const number = String.fromCharCode(97 + col);
				ctx.textBaseline = "bottom";
				ctx.textAlign = "right";
				ctx.fillStyle = isLight ? "#4380b7" : "#f8fafc";
				ctx.fillText(number.toString(), (col + 1) * squareSize - 4, (row + 1) * squareSize - 4);
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
			if (loaded === pieces.length) callback();
		};
		pieceImages[piece] = img;
	}
}

function drawPieceAt(row: number, col: number, piece: string, canvas: HTMLCanvasElement) {

	const ctx = canvas.getContext("2d")!;
	ctx.imageSmoothingEnabled = true;

	const squareSize = canvas.clientWidth / 8;
	const x = col * squareSize;
	const y = row * squareSize;

	const image = pieceImages[piece];
	ctx.drawImage(image, x, y, squareSize, squareSize);
}

function drawPieces(chessboard: Chessboard, canvas: HTMLCanvasElement) {

	for (let row = 0; row < 8; row++) {
		for (let col = 0; col < 8; col++) {
			const piece = chessboard.getPieceAt(`${row}${col}`);
			if (piece) {
				drawPieceAt(row, col, piece, canvas);
			}
		}
	}
}

export function drawMovingPiece(event: MouseEvent, piece: string, canvas: HTMLCanvasElement) {

	const ctx = canvas.getContext("2d")!;
	const rect = canvas.getBoundingClientRect();

	const scaleX = canvas.clientWidth / rect.width;
	const scaleY = canvas.clientHeight / rect.height;
	const mouseX = (event.clientX - rect.left) * scaleX;
	const mouseY = (event.clientY - rect.top) * scaleY;

	const image = pieceImages[piece];
	const squareSize = canvas.clientWidth / 8;

	ctx.drawImage(image, mouseX - squareSize / 2, mouseY - squareSize / 2, squareSize, squareSize);
}

export function highlightSquare(square: string, canvas: HTMLCanvasElement) {

	const ctx = canvas.getContext("2d")!;
	const squareSize = canvas.clientWidth / 8;

	const squareCol = parseInt(square[1]);
	const squareRow = parseInt(square[0]);

	const squareX = squareCol * squareSize;
	const squareY = squareRow * squareSize;

	ctx.lineWidth = 4;
	ctx.strokeStyle = "rgb(255, 139, 139)";
	ctx.strokeRect(squareX + 2, squareY + 2, squareSize - 4, squareSize - 4);
}

export function setupChessboard(chessboard: Chessboard, canvas: HTMLCanvasElement, fromSquare: string | null, toSquare: string | null,) {

	resizeCanvas(canvas);
	drawBoard(fromSquare, toSquare, canvas);
	drawPieces(chessboard, canvas);
}
