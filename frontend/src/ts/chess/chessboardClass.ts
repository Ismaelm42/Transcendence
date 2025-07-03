
export class Chessboard {

	playerColor: string;
	playerColorView: string;
	timeControl: string;
	gameMode: string;
	minRating: number;
	maxRating: number;
	move: number;
	turn: boolean;
	lastMoveFrom: string | null;
	lastMoveTo: string | null;
	game: Map<number, (string | null)[][]>;
    board: (string | null)[][];

	constructor(data: any) {

		this.playerColor = data.playerColor;
		this.playerColorView = data.playerColor;
		this.timeControl = data.timeControl;
		this.gameMode = data.gameMode;
		this.minRating = data.minRating;
		this.maxRating = data.maxRating;
		this.move = data.move || 0;
		this.turn = this.move % 2 === 0;
		this.lastMoveFrom = data.lastMoveFrom || null;
		this.lastMoveTo = data.lastMoveTo || null;
		if (data.game) {
			this.game = new Map<number, (string | null)[][]>(
				data.game.map(([key, value]: [number, (string | null)[][]]) => [
					Number(key),
					value.map(row => row.slice()),
				])
			);
		}
		else
			this.game = new Map<number, (string | null)[][]>();
		if (data.board)
			this.board = data.board.map((row: (string | null)[]) => row.slice());
		else {
			this.board = Array.from({ length: 8 }, () => Array(8).fill(null));
			this.initBoard();
		}
	}

	initBoard() {

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
		this.saveToStorage();
	}

    setPieceAt(square: string, piece: string | null) {

		const row = parseInt(square[0]);
		const col = parseInt(square[1]);
		this.board[row][col] = piece;
	}

	setLastMoves(fromSquare: string | null, toSquare: string | null) {

		this.lastMoveFrom = fromSquare;
		this.lastMoveTo = toSquare;
	}

    getPieceAt(square: string): string | null {

		const row = parseInt(square[0]);
		const col = parseInt(square[1]);
        return this.board[row][col];
    }

	deletePiece(square: string) {

		const row = parseInt(square[0]);
		const col = parseInt(square[1]);
		this.board[row][col] = null;
	}

    movePiece(fromSquare: string , toSquare: string) {

		const piece = this.getPieceAt(fromSquare);
		this.deletePiece(fromSquare);
		this.deletePiece(toSquare);
        this.setPieceAt(toSquare, piece);
		this.game.set(this.move, this.board);
		this.lastMoveFrom = fromSquare;
		this.lastMoveTo = toSquare;
		this.saveToStorage();
		this.move++;
		this.turn = this.move % 2 === 0;
    }

	clearBoard() {

		for (let row = 0; row < 8; row++)
			for (let col = 0; col < 8; col++)
				this.board[row][col] = null;
		this.move = 0;
		this.lastMoveFrom = null;
		this.lastMoveTo = null;
		this.game.clear();
		this.deleteStorage();
	}

	getData(): any {

		const data = {
            playerColor: this.playerColor,
            timeControl: this.timeControl,
            gameMode: this.gameMode,
            minRating: this.minRating,
            maxRating: this.maxRating,
            move: this.move,
            lastMoveFrom: this.lastMoveFrom,
            lastMoveTo: this.lastMoveTo,
            game: Array.from(this.game.entries()),
			board: this.board.map(row => row.slice()),
		}
		return data;
	}

	clone(): Chessboard {

		const data = this.getData();
		const newBoard = new Chessboard(data);
		return newBoard;
	}

	saveToStorage() {

		const data  = this.getData();
		sessionStorage.setItem('chessboard', JSON.stringify(data));
	}

	deleteStorage() {

		sessionStorage.removeItem('chessboard');
	}
}
