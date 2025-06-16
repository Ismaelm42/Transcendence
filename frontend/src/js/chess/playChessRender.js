var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Step } from '../spa/stepRender.js';
import { createCanvas, setupChessboard } from './drawChessboard.js';
import { handleEvents } from './handleEvents.js';
export default class Chess extends Step {
    render(appElement) {
        return __awaiter(this, void 0, void 0, function* () {
            sessionStorage.setItem("current-view", "Chess");
            if (!this.username) {
                this.username = yield this.checkAuth();
            }
            try {
                const htmlContent = yield fetch("../../html/chess/chess.html");
                if (!htmlContent.ok) {
                    throw new Error("Failed to load the HTML file");
                }
                const htmlText = yield htmlContent.text();
                appElement.innerHTML = htmlText;
                const board = document.getElementById("board");
                const canvas = createCanvas(board);
                setupChessboard(canvas);
                handleEvents(canvas);
                function drawPieceAt(square, image, canvas) {
                    const ctx = canvas.getContext("2d");
                    const squareSize = canvas.clientWidth / 8;
                    // Convertir notación algebraica (como 'e1') a coordenadas (col, row)
                    const col = square.charCodeAt(0) - 97; // 'a' → 0, 'h' → 7
                    const row = 8 - parseInt(square[1]); // '1' → 7, '8' → 0
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
        });
    }
}
