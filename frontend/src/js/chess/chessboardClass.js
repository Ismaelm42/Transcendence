export class Chessboard {
    constructor(data) {
        this.playerColorView = data.playerColorView;
        this.lastMoveFrom = data.lastMoveFrom || null;
        this.lastMoveTo = data.lastMoveTo || null;
        this.board = data.board.map((row) => row.slice());
    }
    set(data) {
        console.log(data);
        this.playerColorView = data.playerColorView;
        this.lastMoveFrom = data.lastMoveFrom || null;
        this.lastMoveTo = data.lastMoveTo || null;
        this.board = data.board.map((row) => row.slice());
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
    clearBoard() {
        for (let row = 0; row < 8; row++)
            for (let col = 0; col < 8; col++)
                this.board[row][col] = null;
        this.lastMoveFrom = null;
        this.lastMoveTo = null;
    }
    getData() {
        const data = {
            playerColorView: this.playerColorView,
            lastMoveFrom: this.lastMoveFrom,
            lastMoveTo: this.lastMoveTo,
            board: this.board.map(row => row.slice()),
        };
        return data;
    }
    clone() {
        const data = this.getData();
        const newBoard = new Chessboard(data);
        return newBoard;
    }
}
