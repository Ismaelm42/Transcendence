import { Step } from '../spa/stepRender.js';
import { createCanvas, setupChessboard } from './drawChessboard.js'
import { handleEvents } from './handleEvents.js'

export default class Chess extends Step {

	async render(appElement: HTMLElement): Promise<void> {
		sessionStorage.setItem("current-view", "Chess");
		if (!this.username) {
			this.username = await this.checkAuth();
		}
		try {

			const htmlContent = await fetch("../../html/chess/chess.html");
			if (!htmlContent.ok) {
				throw new Error("Failed to load the HTML file");
			}
			const htmlText = await htmlContent.text();
			appElement.innerHTML = htmlText;
			const board = document.getElementById("board") as HTMLDivElement;

			const canvas = createCanvas(board);
			setupChessboard(canvas);
			handleEvents(canvas);


			function drawPieceAt(square: string, image: HTMLImageElement, canvas: HTMLCanvasElement) {
				const ctx = canvas.getContext("2d")!;
				const squareSize = canvas.clientWidth / 8;

				// Convertir notación algebraica (como 'e1') a coordenadas (col, row)
				const col = square.charCodeAt(0) - 97; // 'a' → 0, 'h' → 7
				const row = 8 - parseInt(square[1]);   // '1' → 7, '8' → 0

				const x = col * squareSize;
				const y = row * squareSize;

				// Desactiva suavizado si estás usando imágenes pixeladas
				ctx.imageSmoothingEnabled = false;

				ctx.drawImage(image, x, y, squareSize, squareSize);
			}


			const pieceImage = new Image();
			pieceImage.src = "../pieces/wn.png";

			pieceImage.onload = () => {
				drawPieceAt("e5", pieceImage, canvas);
			};

		}
		catch (error) {
			console.log(error);
			appElement.innerHTML = `<div id="pong-container">An error occurred while generating the content</div>`;
		}
	}
}
