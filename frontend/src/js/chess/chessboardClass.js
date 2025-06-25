export class Chessboard {
    constructor() {
        this.color = "white";
        this.time = "5|0";
        this.mode = "local";
        this.minRating = 0;
        this.maxRating = 3500;
        this.board = Array.from({ length: 8 }, () => Array(8).fill(null));
        this.game = new Map();
        this.lastMoveFrom = null;
        this.lastMoveTo = null;
        this.move = 0;
    }
    init() {
        this.board[0][0] = "br";
        this.board[0][1] = "bn";
        this.board[0][2] = "bb";
        this.board[0][3] = "bq";
        this.board[0][4] = "bk";
        this.board[0][5] = "bb";
        this.board[0][6] = "bn";
        this.board[0][7] = "br";
        this.board[1][0] = "bp";
        this.board[1][1] = "bp";
        this.board[1][2] = "bp";
        this.board[1][3] = "bp";
        this.board[1][4] = "bp";
        this.board[1][5] = "bp";
        this.board[1][6] = "bp";
        this.board[1][7] = "bp";
        this.board[7][0] = "wr";
        this.board[7][1] = "wn";
        this.board[7][2] = "wb";
        this.board[7][3] = "wq";
        this.board[7][4] = "wk";
        this.board[7][5] = "wb";
        this.board[7][6] = "wn";
        this.board[7][7] = "wr";
        this.board[6][0] = "wp";
        this.board[6][1] = "wp";
        this.board[6][2] = "wp";
        this.board[6][3] = "wp";
        this.board[6][4] = "wp";
        this.board[6][5] = "wp";
        this.board[6][6] = "wp";
        this.board[6][7] = "wp";
        this.game.set(this.move, this.board);
    }
    setPieceAt(square, piece) {
        const row = parseInt(square[0]);
        const col = parseInt(square[1]);
        this.board[row][col] = piece;
    }
    setLastMoves(fromSquare, toSquare) {
        this.lastMoveFrom = fromSquare;
        this.lastMoveTo = toSquare;
    }
    getPieceAt(square) {
        const row = parseInt(square[0]);
        const col = parseInt(square[1]);
        return this.board[row][col];
    }
    deletePiece(square) {
        const row = parseInt(square[0]);
        const col = parseInt(square[1]);
        this.board[row][col] = null;
    }
    movePiece(fromSquare, toSquare) {
        const piece = this.getPieceAt(fromSquare);
        this.deletePiece(fromSquare);
        this.deletePiece(toSquare);
        this.setPieceAt(toSquare, piece);
        this.game.set(this.move++, this.board);
        this.lastMoveFrom = fromSquare;
        this.lastMoveTo = toSquare;
    }
    clearBoard() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                this.board[row][col] = null;
            }
        }
        this.game.clear();
        this.lastMoveFrom = null;
        this.lastMoveTo = null;
        this.move = 0;
    }
    clone() {
        const newBoard = new Chessboard();
        newBoard.board = this.board.map(row => row.slice());
        newBoard.game = new Map();
        this.game.forEach((value, key) => {
            newBoard.game.set(key, value.map(row => row.slice()));
        });
        newBoard.lastMoveFrom = this.lastMoveFrom;
        newBoard.lastMoveTo = this.lastMoveTo;
        newBoard.move = this.move;
        return newBoard;
    }
}
