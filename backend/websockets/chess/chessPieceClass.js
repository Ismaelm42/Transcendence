
export class ChessPiece {

	constructor(color, square) {
		this.color = color;
		this.square = square;
	}

	set(square) {
		this.square = square
	}
	getColor() {
		return this.color;
	}
	getNotation(){}
	isLegalMove(fromSquare, toSquare, board, lastMoveTo) {}
}

export class Pawn extends ChessPiece {

	getNotation() {
		return this.color[0] + 'p';
	}
	isLegalMove(fromSquare, toSquare, board, lastMoveTo) {

		return true
	}
}

export class Knight extends ChessPiece {

	getNotation() {
		return this.color[0] + 'n';
	}
	isLegalMove(fromSquare, toSquare, board, lastMoveTo) {

		return true		
	}
}

export class Bishop extends ChessPiece {

	getNotation() {
		return this.color[0] + 'b';
	}
	isLegalMove(fromSquare, toSquare, board, lastMoveTo) {

		if (fromSquare === toSquare)
			return false;

		const frow = Math.floor(fromSquare / 10);
		const fcol = fromSquare % 10;
		const trow = Math.floor(toSquare / 10);
		const tcol = toSquare % 10;
		let diff = toSquare - fromSquare;

		if (board[trow][tcol] !== null && board[trow][tcol][0] === this.getColor()[0])
			return false;

	// 	if (diff % 9 === 0) {
	// 		if (Math.floor(diff / 9) > 0) {
	// 			for (let square = fromSquare + 9; square != toSquare; square += 9) {
	// 				const srow = Math.floor(square / 10);
	// 				const scol = square % 10;
	// 				if (board[srow][scol] !== null)
	// 					return false;
	// 			}
	// 			return true;
	// 		}
	// 		else {
	// 			for (let square = fromSquare - 9; square != toSquare; square -= 9) {
	// 				const srow = Math.floor(square / 10);
	// 				const scol = square % 10;
	// 				if (board[srow][scol] !== null)
	// 					return false;
	// 			}
	// 			return true;
	// 		}
	// 	}
	// 	else if (diff % 11 === 0) {
	// 		if (Math.floor(diff / 11) > 0) {
	// 			for (let square = fromSquare + 11; square != toSquare; square += 11) {
	// 				const srow = Math.floor(square / 10);
	// 				const scol = square % 10;
	// 				if (board[srow][scol] !== null)
	// 					return false;
	// 			}
	// 			return true;
	// 		}
	// 		else {
	// 			for (let square = fromSquare - 11; square != toSquare; square -= 11) {
	// 				const srow = Math.floor(square / 10);
	// 				const scol = square % 10;
	// 				if (board[srow][scol] !== null)
	// 					return false;
	// 			}
	// 			return true;
	// 		}
	// 	}
	// 	return false

		const rowDiff = trow - frow;
		const colDiff = tcol - fcol;

		// No es diagonal
		if (Math.abs(rowDiff) !== Math.abs(colDiff)) return false;

		const rowStep = rowDiff > 0 ? 1 : -1;
		const colStep = colDiff > 0 ? 1 : -1;

		let row = frow + rowStep;
		let col = fcol + colStep;

		while (row !== trow && col !== tcol) {
			if (board[row][col] !== null) return false;
			row += rowStep;
			col += colStep;
		}

		return true;

	}
}

export class Rook extends ChessPiece {

	getNotation() {
		return this.color[0] + 'r';
	}
	isLegalMove(fromSquare, toSquare, board, lastMoveTo) {

		if (fromSquare === toSquare)
			return false;

		const frow = Math.floor(fromSquare / 10);
		const fcol = fromSquare % 10;
		const trow = Math.floor(toSquare / 10);
		const tcol = toSquare % 10;

		if (board[trow][tcol] !== null && board[trow][tcol][0] === this.getColor()[0])
			return false;
		// if (frow === trow) {
		// 	for (let i = tcol - fcol; i !== 0; tcol > fcol ? i-- : i++)
		// 		if ((tcol - i) !== tcol && (tcol - i) !== fcol && board[trow][tcol - i] !== null)
		// 			return false;
		// 	return true;
		// }
		// else if (fcol === tcol) {
		// 	for (let i = trow - frow; i !== 0; trow > frow ? i-- : i++)
		// 		if ((trow - i) !== trow && (trow - i) !== frow && board[trow - i][tcol] !== null)
		// 			return false;
		// 	return true;
		// }
		// return false;
		// Movimiento horizontal
		if (frow === trow) {
			const step = tcol > fcol ? 1 : -1;
			for (let col = fcol + step; col !== tcol; col += step) {
				if (board[frow][col] !== null) return false;
			}
			return true;
		}

		// Movimiento vertical
		if (fcol === tcol) {
			const step = trow > frow ? 1 : -1;
			for (let row = frow + step; row !== trow; row += step) {
				if (board[row][fcol] !== null) return false;
			}
			return true;
		}

		// No es ni horizontal ni vertical
		return false;
	}
}

export class Queen extends ChessPiece {

	getNotation() {
		return this.color[0] + 'q';
	}
	isLegalMove(fromSquare, toSquare, board, lastMoveTo) {
		const rook = new Rook(this.color, fromSquare);
		const bishop = new Bishop(this.color, fromSquare);
		if (rook.isLegalMove(fromSquare, toSquare, board, lastMoveTo) || bishop.isLegalMove(fromSquare, toSquare, board, lastMoveTo))
			return true;
		return false;
	}
}

export class King extends ChessPiece {

	castle = true;

	getNotation() {
		return this.color[0] + 'k';
	}
	isLegalMove(fromSquare, toSquare, board, lastMoveTo) {

		return true		
	}	
}
