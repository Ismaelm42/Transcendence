export class ChessPiece {

	constructor(color, square) {
		this.color = color;
		this.square = square;
	}

	set(square) {
		this.square = square;
	}

	getColor() {
		return this.color;
	}
	
	getSquare() {
		return this.square;
	}

	checkMoveBasicValidity(fromSquare, toSquare, board) {

		const trow = Math.floor(toSquare / 10);
		const tcol = toSquare % 10;

		if (trow < 0 || trow > 7 || tcol < 0 || tcol > 7)
    		return false;
		if (fromSquare === toSquare)
			return false;
		if (board[trow][tcol] !== null && board[trow][tcol].getColor() === this.getColor())
			return false;
		return true;
	}
	
	clone() {}
	
	getNotation() {}
	
	legalMoves() {}
	
	isLegalMove(fromSquare, toSquare, board, lastMoveFrom, lastMoveTo) {}
}

export class Pawn extends ChessPiece {

	clone() {
		return new Pawn(this.color, this.square);
	}

	getNotation() {
		return this.color[0] + 'p';
	}

	isPromotion(toSquare) {

		const trow = Math.floor(toSquare / 10);
		const promotionRow = this.getColor() === 'white' ? 0 : 7;

		if (trow === promotionRow)
			return true;

		return false;
	}

	isEnPassant(fromSquare, toSquare, board, lastMoveFrom, lastMoveTo) {

		const frow = Math.floor(fromSquare / 10);
		const color = this.getColor();
		const direction = color === 'white' ? -10 : 10;
		const capture = [direction - 1, direction + 1];
		const lmtrow = Math.floor(lastMoveTo / 10);
		const lmtcol = lastMoveTo % 10;
		const enemyColor = color === 'white' ? 'black' : 'white';
		const ennemyLastMove = Math.abs(lastMoveFrom - lastMoveTo);
		const enPassantRow = color === 'white' ? 3 : 4;

		if (capture.includes(toSquare - fromSquare) && frow === enPassantRow && ennemyLastMove === 20 && toSquare === (lastMoveTo + direction) && board[lmtrow][lmtcol].getNotation() === enemyColor[0] + 'p') {
			return true;
		}

		return false;
	}

	isLegalMove(fromSquare, toSquare, board, lastMoveFrom, lastMoveTo) {

		if(!this.checkMoveBasicValidity(fromSquare, toSquare, board))
			return false;

		const frow = Math.floor(fromSquare / 10);
		const fcol = fromSquare % 10;
		const trow = Math.floor(toSquare / 10);
		const tcol = toSquare % 10;
		const color = this.getColor();
		const direction = color === 'white' ? -10 : 10;
		const rowDirection = color === 'white' ? -1 : 1;
		const capture = [direction - 1, direction + 1];
		const enemyColor = color === 'white' ? 'black' : 'white';
		const startRow = color === 'white' ? 6 : 1;

		if (board[trow][tcol] === null && toSquare === fromSquare + direction)
			return true;
		if (capture.includes(toSquare - fromSquare) && board[trow][tcol] !== null && board[trow][tcol].getColor() === enemyColor)
			return true;
		if (board[trow][tcol] === null && board[frow + rowDirection][fcol] === null && frow === startRow && toSquare === fromSquare + 2 * direction)
			return true;
		if (this.isEnPassant(fromSquare, toSquare, board, lastMoveFrom, lastMoveTo))
			return true;

		return false;
	}

	legalMoves(fromSquare, board, lastMoveFrom, lastMoveTo) {

		const legalMoves = [];
		const color = this.getColor();
		const direction = color === 'white' ? -10 : 10;
		const leftCapture = fromSquare + direction - 1;
		const rightCapture = fromSquare + direction + 1;
		const oneStep = fromSquare + direction;
		const twoStep = fromSquare + 2 * direction;

		if (this.isLegalMove(fromSquare, oneStep, board, lastMoveFrom, lastMoveTo))
			legalMoves.push(oneStep);
		if (this.isLegalMove(fromSquare, twoStep, board, lastMoveFrom, lastMoveTo))
			legalMoves.push(twoStep);
		if (this.isLegalMove(fromSquare, leftCapture, board, lastMoveFrom, lastMoveTo))
			legalMoves.push(leftCapture);
		if (this.isLegalMove(fromSquare, rightCapture, board, lastMoveFrom, lastMoveTo))
			legalMoves.push(rightCapture);

		return legalMoves;
	}
}

export class Knight extends ChessPiece {

	clone() {
		return new Knight(this.color, this.square);
	}

	getNotation() {
		return this.color[0] + 'n';
	}

	isLegalMove(fromSquare, toSquare, board, lastMoveFrom, lastMoveTo) {

		if(!this.checkMoveBasicValidity(fromSquare, toSquare, board))
			return false;

		const moves = [21, -21, 19, -19, 12, -12, 8, -8];
		
		if (moves.includes(toSquare - fromSquare))
			return true;

		return false;
	}

	legalMoves(fromSquare, board, lastMoveFrom, lastMoveTo) {
	
		const legalMoves = [];
		const possibleMoves = [21, -21, 19, -19, 12, -12, 8, -8];

		for (const move of possibleMoves) {
			const toSquare = fromSquare + move;
			if (this.isLegalMove(fromSquare, toSquare, board, lastMoveFrom, lastMoveTo))
				legalMoves.push(toSquare);
		}

		return legalMoves;	
	}
}

export class Bishop extends ChessPiece {

	clone() {
		return new Bishop(this.color, this.square);
	}

	getNotation() {
		return this.color[0] + 'b';
	}

	isLegalMove(fromSquare, toSquare, board, lastMoveFrom, lastMoveTo) {

		if(!this.checkMoveBasicValidity(fromSquare, toSquare, board))
			return false;

		const frow = Math.floor(fromSquare / 10);
		const fcol = fromSquare % 10;
		const trow = Math.floor(toSquare / 10);
		const tcol = toSquare % 10;

		const rowDiff = trow - frow;
		const colDiff = tcol - fcol;
		
		if (Math.abs(rowDiff) !== Math.abs(colDiff))
			return false;

		const rowStep = rowDiff > 0 ? 1 : -1;
		const colStep = colDiff > 0 ? 1 : -1;
		let row = frow + rowStep;
		let col = fcol + colStep;
		
		while (row !== trow && col !== tcol) {
			if (board[row][col] !== null)
				return false;
			row += rowStep;
			col += colStep;
		}

		return true;
	}
	
	legalMoves(fromSquare, board, lastMoveFrom, lastMoveTo) {

		const legalMoves = [];
		const directions = [-11, -9, 9, 11];

		for (const dir of directions) {
			let toSquare = fromSquare + dir;

			while (this.isLegalMove(fromSquare, toSquare, board, lastMoveFrom, lastMoveTo)) {
				legalMoves.push(toSquare);
				const row = Math.floor(toSquare / 10);
				const col = toSquare % 10;
				if (board[row][col] !== null)
					break;
				toSquare += dir;
			}
		}

		return legalMoves;
	}
}

export class Rook extends ChessPiece {

	castle = true;

	clone() {

		const rook = new Rook(this.color, this.square);
		rook.castle = this.castle;
		return rook;
	}

	getNotation() {
		return this.color[0] + 'r';
	}

	invalidCastling() {
		this.castle = false;
	}

	isLegalMove(fromSquare, toSquare, board, lastMoveFrom, lastMoveTo) {

		if(!this.checkMoveBasicValidity(fromSquare, toSquare, board))
			return false;

		const frow = Math.floor(fromSquare / 10);
		const fcol = fromSquare % 10;
		const trow = Math.floor(toSquare / 10);
		const tcol = toSquare % 10;

		if (frow === trow) {
			const step = tcol > fcol ? 1 : -1;
			for (let col = fcol + step; col !== tcol; col += step)
				if (board[frow][col] !== null)
					return false;
			return true;
		}
		else if (fcol === tcol) {
			const step = trow > frow ? 1 : -1;
			for (let row = frow + step; row !== trow; row += step)
				if (board[row][fcol] !== null)
					return false;
			return true;
		}
		return false;
	}

	legalMoves(fromSquare, board, lastMoveFrom, lastMoveTo) {

		const legalMoves = [];
		const directions = [-10, 10, -1, 1];

		for (const dir of directions) {
			let toSquare = fromSquare + dir;
			while (this.isLegalMove(fromSquare, toSquare, board, lastMoveFrom, lastMoveTo)) {
				legalMoves.push(toSquare);
				const row = Math.floor(toSquare / 10);
				const col = toSquare % 10;
				if (board[row][col] !== null)
					break;
				toSquare += dir;
			}
		}

		return legalMoves;
	}
}

export class Queen extends ChessPiece {

	clone() {
		return new Queen(this.color, this.square);
	}

	getNotation() {
		return this.color[0] + 'q';
	}

	isLegalMove(fromSquare, toSquare, board, lastMoveFrom, lastMoveTo) {
	
		const rook = new Rook(this.color, fromSquare);
		const bishop = new Bishop(this.color, fromSquare);
	
		if (rook.isLegalMove(fromSquare, toSquare, board, lastMoveFrom, lastMoveTo) || bishop.isLegalMove(fromSquare, toSquare, board, lastMoveFrom, lastMoveTo))
			return true;

		return false;
	}

	legalMoves(fromSquare, board, lastMoveFrom, lastMoveTo) {

		const rook = new Rook(this.color, fromSquare);
		const bishop = new Bishop(this.color, fromSquare);
		const rookMoves = rook.legalMoves(fromSquare, board, lastMoveFrom, lastMoveTo);
		const bishopMoves = bishop.legalMoves(fromSquare, board, lastMoveFrom, lastMoveTo);
		const combinedMoves = [...new Set([...rookMoves, ...bishopMoves])];

		return combinedMoves;
	}
}

export class King extends ChessPiece {

	castle = true;

	clone() {

		const king = new King(this.color, this.square);
		king.castle = this.castle;
		return king;
	}

	getNotation() {
		return this.color[0] + 'k';
	}

	invalidCastling() {
		this.castle = false;
	}

	isQueenSideCastle(fromSquare, toSquare, board) {

		const frow = Math.floor(fromSquare / 10);
		const fcol = fromSquare % 10;
		const trow = Math.floor(toSquare / 10);
		const tcol = toSquare % 10;

		if (this.castle === true && this.getColor() === 'white' && toSquare === 72 && board[frow][fcol - 1] === null && board[trow][tcol] === null && board[trow][0] != null) {
			const rook = board[trow][0];
			if (rook.getNotation() === 'wr' && rook.castle === true)
				return true;
		}
		if (this.castle === true && this.getColor() === 'black' && toSquare === 2 && board[frow][fcol - 1] === null && board[trow][tcol] === null && board[trow][0] != null) {
			const rook = board[trow][0];
			if (rook.getNotation() === 'br' && rook.castle === true)
				return true;
		}

		return false;
	}

	isKingSideCastle(fromSquare, toSquare, board) {

		const frow = Math.floor(fromSquare / 10);
		const fcol = fromSquare % 10;
		const trow = Math.floor(toSquare / 10);
		const tcol = toSquare % 10;

		if (this.castle === true && this.getColor() === 'white' && toSquare === 76 && board[frow][fcol + 1] === null && board[trow][tcol] === null && board[trow][7] != null) {
			const rook = board[trow][7];
			if (rook.getNotation() === 'wr' && rook.castle === true)
				return true;
		}
		if (this.castle === true && this.getColor() === 'black' && toSquare === 6 && board[frow][fcol + 1] === null && board[trow][tcol] === null && board[trow][7] != null) {
			const rook = board[trow][7];
			if (rook.getNotation() === 'br' && rook.castle === true)
				return true;
		}

		return false;
	}

	isLegalMove(fromSquare, toSquare, board, lastMoveFrom, lastMoveTo) {

		if(!this.checkMoveBasicValidity(fromSquare, toSquare, board))
			return false;

		const moves = [11, -11, 10, -10, 9, -9, 1, -1];
		
		if (moves.includes(toSquare - fromSquare))
			return true;
		if (this.isKingSideCastle(fromSquare, toSquare, board) || this.isQueenSideCastle(fromSquare, toSquare, board))
			return true;
		return false;
	}

	legalMoves(fromSquare, board, lastMoveFrom, lastMoveTo) {

		const legalMoves = [];
		const moves = [11, -11, 10, -10, 9, -9, 1, -1];

		for (const move of moves) {
			const toSquare = fromSquare + move;
			if (this.isLegalMove(fromSquare, toSquare, board, lastMoveFrom, lastMoveTo))
				legalMoves.push(toSquare);
		}

		const kingSideCastleSquare = this.getColor() === 'white' ? 76 : 6;
		const queenSideCastleSquare = this.getColor() === 'white' ? 72 : 2;

		if (this.isLegalMove(fromSquare, kingSideCastleSquare, board, lastMoveFrom, lastMoveTo))
			legalMoves.push(kingSideCastleSquare);
		if (this.isLegalMove(fromSquare, queenSideCastleSquare, board, lastMoveFrom, lastMoveTo))
			legalMoves.push(queenSideCastleSquare);

		return legalMoves;
	}
}
