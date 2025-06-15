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
                // 1. Crear dinámicamente un elemento <canvas> en el DOM
                const canvas = document.createElement("canvas");
                // Hacer que el canvas ocupe el 100% del ancho de su contenedor (responsivo)
                canvas.style.width = "100%";
                // Hacer que el canvas también ocupe el 100% de la altura de su contenedor
                canvas.style.height = "100%";
                // Eliminar márgenes o espacios extra: se comporta como un bloque normal
                canvas.style.display = "block";
                // Limitar el ancho máximo del canvas a 600px (en pantallas grandes)
                canvas.style.maxWidth = "600px";
                // Insertar el canvas dentro del contenedor appElement (por ejemplo, un <div>)
                board.insertBefore(canvas, board.firstChild);
                // 2. Función que ajusta el tamaño interno real del canvas (no solo visual)
                // El canvas necesita que el tamaño en píxeles coincida con el tamaño visual para evitar borrosidad
                function resizeCanvas() {
                    const rect = canvas.getBoundingClientRect();
                    const rawSize = Math.min(rect.width, rect.height);
                    const size = Math.floor(rawSize / 8) * 8; // redondea al múltiplo de 8 más cercano por debajo
                    console.log("size", size);
                    canvas.width = size;
                    canvas.height = size;
                }
                // 3. Obtener el contexto 2D, que es lo que permite dibujar en el canvas
                const ctx = canvas.getContext("2d");
                function getSquareSize() {
                    return canvas.width / 8;
                }
                // 4. Dibujar el tablero de ajedrez
                function drawBoard() {
                    const squareSize = getSquareSize(); // calcular tamaño de cada casilla
                    console.log("squareSize", squareSize);
                    // Recorrer filas y columnas (8x8)
                    for (let row = 0; row < 8; row++) {
                        for (let col = 0; col < 8; col++) {
                            // Alternar color claro/oscuro según suma fila+columna
                            const isLight = (row + col) % 2 === 0;
                            // Asignar color en función de si es casilla clara u oscura
                            ctx.fillStyle = isLight ? "#f8fafc" : "#4380b7";
                            // Dibujar la casilla en la posición correspondiente
                            ctx.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);
                        }
                    }
                }
                // 5. Detectar clics sobre el canvas para saber en qué casilla se ha hecho clic
                canvas.addEventListener("click", (event) => {
                    const rect = canvas.getBoundingClientRect(); // obtener posición y tamaño del canvas
                    const x = event.clientX - rect.left; // coordenada X relativa al canvas
                    const y = event.clientY - rect.top; // coordenada Y relativa al canvas
                    const squareSize = getSquareSize(); // tamaño de cada casilla
                    // Calcular columna (0–7) y fila (0–7) según la posición del clic
                    const col = Math.floor(x / squareSize);
                    const row = Math.floor(y / squareSize);
                    // Convertir columna a letra (a-h) y fila a número (8–1, de arriba a abajo)
                    const file = String.fromCharCode(97 + col); // 97 = 'a'
                    const rank = 8 - row;
                    // Mostrar en consola la casilla clicada (formato algebraico: e4, b6, etc.)
                    console.log(`Has hecho clic en: ${file}${rank}`);
                });
                // 6. Si el usuario cambia el tamaño de la ventana, redimensionar y redibujar el tablero
                window.addEventListener("resize", () => {
                    resizeCanvas(); // ajustar tamaño interno del canvas
                    drawBoard(); // volver a pintar el tablero con las nuevas dimensiones
                });
                // 7. Inicialización: establecer tamaño y dibujar tablero al cargar
                resizeCanvas(); // ajustar dimensiones al tamaño actual del contenedor
                drawBoard(); // dibujar el tablero por primera vez
            }
            catch (error) {
                console.log(error);
                appElement.innerHTML = `<div id="pong-container">An error occurred while generating the content</div>`;
            }
        });
    }
}
