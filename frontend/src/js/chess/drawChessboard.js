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
function drawBoard(chessboard, selectedSquares, arrows, canvas) {
    const ctx = canvas.getContext("2d");
    const squareSize = canvas.clientWidth / 8;
    const fsRow = chessboard.lastMoveFrom ? parseInt(chessboard.lastMoveFrom[0]) : null;
    const fsCol = chessboard.lastMoveFrom ? parseInt(chessboard.lastMoveFrom[1]) : null;
    const tsRow = chessboard.lastMoveTo ? parseInt(chessboard.lastMoveTo[0]) : null;
    const tsCol = chessboard.lastMoveTo ? parseInt(chessboard.lastMoveTo[1]) : null;
    ctx.font = `bold ${squareSize / 5}px Arial`;
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const isLight = (row + col) % 2 === 0;
            if (selectedSquares && selectedSquares.has(`${row}${col}`))
                ctx.fillStyle = "rgb(255, 139, 139)";
            else if ((fsCol === col && fsRow === row) || (tsCol === col && tsRow === row)) {
                ctx.fillStyle = "rgb(154, 234, 236)";
            }
            else
                ctx.fillStyle = isLight ? "rgb(255, 255, 255)" : "rgb(67, 128, 183)";
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
    if (arrows) {
        for (const [, [from, to]] of arrows) {
            drawArrow(from, to, canvas);
        }
    }
}
export function preloadImages(callback) {
    const pieces = ["wr", "wn", "wb", "wq", "wk", "wp", "br", "bn", "bb", "bq", "bk", "bp"];
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
function drawPieceAt(row, col, piece, canvas) {
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    const squareSize = canvas.clientWidth / 8;
    const x = col * squareSize;
    const y = row * squareSize;
    const image = pieceImages[piece];
    ctx.drawImage(image, x, y, squareSize, squareSize);
}
function drawPieces(chessboard, canvas) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = chessboard.getPieceAt(`${row}${col}`);
            if (piece)
                drawPieceAt(row, col, piece, canvas);
        }
    }
}
export function drawMovingPiece(event, piece, canvas) {
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.clientWidth / rect.width;
    const scaleY = canvas.clientHeight / rect.height;
    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;
    const image = pieceImages[piece];
    const squareSize = canvas.clientWidth / 8;
    ctx.drawImage(image, mouseX - squareSize / 2, mouseY - squareSize / 2, squareSize, squareSize);
}
export function highlightSquare(square, canvas) {
    const ctx = canvas.getContext("2d");
    const squareSize = canvas.clientWidth / 8;
    const squareCol = parseInt(square[1]);
    const squareRow = parseInt(square[0]);
    const squareX = squareCol * squareSize;
    const squareY = squareRow * squareSize;
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgb(94, 101, 134)";
    ctx.strokeRect(squareX + 2, squareY + 2, squareSize - 4, squareSize - 4);
}
export function drawArrow(fromSquare, toSquare, canvas) {
    const ctx = canvas.getContext("2d");
    const squareSize = canvas.clientWidth / 8;
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
    ctx.strokeStyle = "rgba(255, 191, 62, 0.8)";
    ctx.lineWidth = squareSize * 0.2;
    ctx.stroke();
    // Draw arrow head
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(leftX, leftY);
    ctx.lineTo(rightX, rightY);
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 191, 62, 0.8)";
    ctx.fill();
}
export function setupChessboard(chessboard, canvas, selectedSquares, arrows) {
    resizeCanvas(canvas);
    drawBoard(chessboard, selectedSquares, arrows, canvas);
    drawPieces(chessboard, canvas);
}
