export function createCanvas(board) {
    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    board.insertBefore(canvas, board.firstChild);
    return canvas;
}
// Correct function
function resizeCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    // Tamaño interno real en píxeles
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    // Escala para que 1 unidad de coordenadas = 1 px visible
    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset
    ctx.scale(dpr, dpr); // Escala todo el sistema de coordenadas
}
function drawBoard(canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    const squareSize = canvas.clientWidth / 8;
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const isLight = (row + col) % 2 === 0;
            ctx.fillStyle = isLight ? "#f8fafc" : "#4380b7";
            ctx.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);
        }
    }
}
export function setupChessboard(canvas) {
    resizeCanvas(canvas);
    drawBoard(canvas);
}
// function resizeCanvas(canvas: HTMLCanvasElement) {
// 	const rect = canvas.getBoundingClientRect();
// 	const size = Math.floor(rect.width / 8) * 8;
// 	canvas.width = size;
// 	canvas.height = size;
// }
