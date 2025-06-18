const pieceImages = {};
export function createCanvas(board) {
    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    board.insertBefore(canvas, board.firstChild);
    return canvas;
}
function resizeCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
}
function drawBoard(canvas) {
    const ctx = canvas.getContext("2d");
    const squareSize = canvas.clientWidth / 8;
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const isLight = (row + col) % 2 === 0;
            ctx.fillStyle = isLight ? "#f8fafc" : "#4380b7";
            ctx.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);
        }
    }
}
function getPieceImage(piece) {
    if (!pieceImages[piece]) {
        const img = new Image();
        img.src = `../pieces/${piece}.png`;
        pieceImages[piece] = img;
    }
    return pieceImages[piece];
}
function drawPieceAt(row, col, piece, canvas) {
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    const squareSize = canvas.clientWidth / 8;
    const x = col * squareSize;
    const y = row * squareSize;
    const image = getPieceImage(piece);
    if (image.complete) {
        ctx.drawImage(image, x, y, squareSize, squareSize);
    }
    else {
        image.onload = () => {
            ctx.drawImage(image, x, y, squareSize, squareSize);
        };
    }
}
function drawPieces(chessboard, canvas) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = chessboard.getPieceAt(`${row}${col}`);
            if (piece) {
                drawPieceAt(row, col, piece, canvas);
            }
        }
    }
}
export function setupChessboard(chessboard, canvas) {
    console.log("AQUIIII");
    resizeCanvas(canvas);
    drawBoard(canvas);
    drawPieces(chessboard, canvas);
}
