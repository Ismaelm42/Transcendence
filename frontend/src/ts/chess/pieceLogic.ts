
class Position {
	public x: number;
	public y: number;
	public alg: string;

	constructor(pos: string) {

		this.x = pos.charCodeAt(0) - 'a'.charCodeAt(0);
		this.y = parseInt(pos[1], 10);
		this.alg = pos;
	}
}

abstract class ChessPiece {

	constructor(
		public color: 'white' | 'black',
		public position: Position
	) { }

	abstract getLegalMoves(board: Board): Position[];
}

class Pawn extends ChessPiece {

	getLegalMoves(board: Board): Position[] {
		return [];
	}
}

class Knight extends ChessPiece {

	getLegalMoves(board: Board): Position[] {
		return [];
	}
}

class Bishop extends ChessPiece {

	getLegalMoves(board: Board): Position[] {
		return [];
	}
}

class Rook extends ChessPiece {

	getLegalMoves(board: Board): Position[] {
		return [];
	}
}

class Queen extends ChessPiece {

	getLegalMoves(board: Board): Position[] {
		return [];
	}
}

class King extends ChessPiece {

	getLegalMoves(board: Board): Position[] {
		return [];
	}
}

















class Board {

	chessBoard: (ChessPiece | null)[][];

    constructor() {
        this.chessBoard = Array.from({ length: 8 }, () =>
            Array.from({ length: 8 }, () => null)
        );
    }
}
