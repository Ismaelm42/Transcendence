import { Pawn, Knight, Bishop, Rook, Queen, King, ChessPiece } from './chessPieceClass.js'

export class Chessboard {

	constructor(data) {

		this.hostId = data.hostId;
		this.guestId = data.guestId;
		this.hostColor = data.hostColor;
		this.guestColor = this.getGuestColor();
		this.hostColorView = data.hostColorView || this.hostColor;
		this.guestColorView = data.guestColorView || this.guestColor;
		this.gameMode = data.gameMode;
		this.timeControl = data.timeControl;
		this.move = data.move || 0;
		this.turn = this.getTurn();
		this.lastMoveFrom = data.lastMoveFrom || null;
		this.lastMoveTo = data.lastMoveTo || null;
		if (data.game) {
			this.game = new Map(
				data.game.map(([key, value]) => [
					Number(key),
					value.map(row => row.slice()),
				])
			);
		}
		else
			this.game = new Map();
		if (data.board)
			this.board = data.board.map(row => row.slice());
		else {
			this.board = Array.from({ length: 8 }, () => Array(8).fill(null));
			this.initBoard();
		}
	}

	initBoard() {

		this.board[0][0] = new Rook('black', 0);
		this.board[0][1] = new Knight('black', 1);
		this.board[0][2] = new Bishop('black', 2);
		this.board[0][3] = new Queen('black', 3);
		this.board[0][4] = new King('black', 4);
		this.board[0][5] = new Bishop('black', 5);
		this.board[0][6] = new Knight('black', 6);
		this.board[0][7] = new Rook('black', 7);
		this.board[1][0] = new Pawn('black', 10);
		this.board[1][1] = new Pawn('black', 11);
		this.board[1][2] = new Pawn('black', 12);
		this.board[1][3] = new Pawn('black', 13);
		this.board[1][4] = new Pawn('black', 14);
		this.board[1][5] = new Pawn('black', 15);
		this.board[1][6] = new Pawn('white', 16);
		this.board[1][7] = new Pawn('black', 17);
		this.board[7][0] = new Rook('white', 70);
		this.board[7][1] = new Knight('white', 71);
		this.board[7][2] = new Bishop('white', 72);
		this.board[7][3] = new Queen('white', 73);
		this.board[7][4] = new King('white', 74);
		this.board[7][5] = new Bishop('white', 75);
		this.board[7][6] = new Knight('white', 76);
		this.board[7][7] = new Rook('white', 77);
		this.board[6][0] = new Pawn('white', 60);
		this.board[6][1] = new Pawn('white', 61);
		this.board[6][2] = new Pawn('white', 62);
		this.board[6][3] = new Pawn('white', 63);
		this.board[6][4] = new Pawn('white', 64);
		this.board[6][5] = new Pawn('white', 65);
		this.board[6][6] = new Pawn('white', 66);
		this.board[6][7] = new Pawn('white', 67);
		this.game.set(this.move++, this.board);
	}

	getGuestColor() {
		return (this.hostColor !== 'white') ? 'white' : 'black';
	}

	getTurn() {
		return (this.move % 2 !== 0) ? 'white' : 'black';
	}

	setPieceAt(square, piece) {

		const row = Math.floor(square / 10);
		const col = square % 10;
		this.board[row][col] = piece;
		piece.set(square)
	}

	deletePieceAt(square) {

		const row = Math.floor(square / 10);
		const col = square % 10;
		this.board[row][col] = null;
	}

	setLastMoves(fromSquare, toSquare) {

		this.lastMoveFrom = fromSquare;
		this.lastMoveTo = toSquare;
	}

	getPieceAt(square) {

		const row = Math.floor(square / 10);
		const col = square % 10;
		return this.board[row][col];
	}

	movePiece(piece, fromSquare, toSquare) {

		this.deletePieceAt(fromSquare);
		this.deletePieceAt(toSquare);
		this.setPieceAt(toSquare, piece);
	}

	buildClientMessage(type, fromSquare, toSquare) {

		return {
			type: type,
			moveFrom: fromSquare,
			moveTo: toSquare,
			lastMoveFrom: this.lastMoveFrom === null ? null : this.lastMoveFrom.toString(),
			lastMoveTo: this.lastMoveTo === null ? null : this.lastMoveTo.toString(),
			board: this.getBoard(),
		};
	}

	isPromotion(piece, toSquare) {

		if (piece.getNotation()[1] === 'p' && piece.isPromotion(toSquare))
			return true;
		return false;
	}

	isEnPassant(piece, fromSquare, toSquare) {

		if (piece.getNotation()[1] === 'p' && piece.isEnPassant(fromSquare, toSquare, this.board, this.lastMoveFrom, this.lastMoveTo))
			return true;
		return false;
	}

	isCastling(piece, fromSquare, toSquare) {

		if (piece.getNotation()[1] === 'k' && (piece.isKingSideCastle(fromSquare, toSquare, this.board) || piece.isQueenSideCastle(fromSquare, toSquare, this.board)))
			return true;
		return false;
	}

	isValidMove(fromSquare, toSquare, piece, color, id) {

		const playerColor = (id === this.hostId ? this.hostColor : this.guestColor);

		if (color !== piece.color)
			return false;
		if (this.gameMode === 'online' && (playerColor !== color))
			return false;
		if (!piece.isLegalMove(fromSquare, toSquare, this.board, this.lastMoveFrom, this.lastMoveTo))
			return false;
		if (this.isCheck(fromSquare, toSquare, color))
			return false;
		return true;
	}

	findKing(color, board) {

		const notation = (color === 'white' ? 'wk' : 'bk');

		for (let row = 0; row < board.length; row++) {
			for (let col = 0; col < board[row].length; col++) {
				const piece = board[row][col];
				if (piece && piece.getNotation() === notation)
					return piece;
			}
		}
		return null;
	}

	isCheck(fromSquare, toSquare, color) {

		const steps = Math.abs(toSquare - fromSquare);
		const isKingRow = Math.floor(fromSquare / 10);
		const isKingCol = fromSquare % 10;
		const isKing = this.board[isKingRow][isKingCol];

		if (isKing.getNotation()[1] === 'k' && isKing.castle === true && steps === 2)
			if (this.isCheck(fromSquare, fromSquare, color) || this.isCheck(fromSquare, fromSquare < toSquare ? fromSquare + 1 : fromSquare - 1, color))
				return true;

		const copy = this.clone();
		const board = copy.board;
		copy.movePiece(copy.getPieceAt(fromSquare), fromSquare, toSquare);
		copy.saveMove(fromSquare, toSquare);
		const kingPiece = copy.findKing(color, board);
		const square = kingPiece.getSquare();

		for (let row = 0; row < board.length; row++) {
			for (let col = 0; col < board[row].length; col++) {
				const piece = board[row][col];
				if (piece && piece.getColor() !== color)
					if (piece.isLegalMove(piece.getSquare(), square, copy.board, copy.lastMoveFrom, copy.lastMoveTo))
						return true;
			}
		}
		return false;
	}

	isCheckMateOrStaleMate(fromSquare, toSquare, color) {

		const mateType = this.isCheck(fromSquare, toSquare, color) === true ? 'checkmate' : 'stalemate';

		const copy = this.clone()
		copy.movePiece(copy.getPieceAt(fromSquare), fromSquare, toSquare);
		copy.saveMove(fromSquare, toSquare);
		for (let row = 0; row < copy.board.length; row++) {
			for (let col = 0; col < copy.board[row].length; col++) {
				const piece = copy.board[row][col];
				if (piece && piece.getColor() === color) {
					const legalMoves = piece.legalMoves(piece.getSquare(), copy.board, copy.lastMoveFrom, copy.lastMoveTo);
					for (const move of legalMoves)
						if (!copy.isCheck(piece.getSquare(), move, color))
							return (mateType === 'checkmate' ? 'check' : null);
				}
			}
		}
		return mateType;
	}

	saveMove(fromSquare, toSquare) {

		this.lastMoveFrom = fromSquare;
		this.lastMoveTo = toSquare;
		this.game.set(this.move, this.board);
		this.move++;
		this.turn = this.move % 2 === 0;
	}

	handlePromotion(fromSquare, toSquare, promoteTo) {

		const color = this.getTurn();
		let piece;

		if (promoteTo === 'q')
			piece = new Queen(color, toSquare);
		else if (promoteTo === 'r')
			piece = new Rook(color, toSquare);
		else if (promoteTo === 'b')
			piece = new Bishop(color, toSquare);
		else if (promoteTo === 'n')
			piece = new Knight(color, toSquare);
		this.deletePieceAt(fromSquare);
		this.setPieceAt(fromSquare, piece);
	}

	makeMove(fromSquare, toSquare) {

		const piece = this.getPieceAt(fromSquare);

		if (this.isEnPassant(piece, fromSquare, toSquare))
			this.deletePieceAt(this.lastMoveTo);
		else if (this.isCastling(piece, fromSquare, toSquare)) {
			if (toSquare - fromSquare > 0)
				this.movePiece(this.getPieceAt(toSquare + 1), toSquare + 1, fromSquare + 1);
			else
				this.movePiece(this.getPieceAt(toSquare - 2), toSquare - 2, toSquare + 1);
		}
		if (piece.getNotation()[1] === 'k' ||  piece.getNotation()[1] === 'r')
			piece.invalidCastling();
		this.movePiece(piece, fromSquare, toSquare);
	}

	handleMove(data, id) {

		const fromSquare = Number(data.moveFrom);
		const toSquare = Number(data.moveTo);
		const piece = this.getPieceAt(fromSquare);
		const color = this.getTurn();
		const opponentColor = color === 'white' ? 'black' : 'white';

		if (data.promoteTo)
			this.handlePromotion(fromSquare, toSquare, data.promoteTo);
		else {
			if (!this.isValidMove(fromSquare, toSquare, piece, color, id))
				return this.buildClientMessage('move', data.moveFrom, data.moveTo);
			if (this.isPromotion(piece, toSquare))
				return this.buildClientMessage('promote', data.moveFrom, data.moveTo);
		}
		const result = this.isCheckMateOrStaleMate(fromSquare, toSquare, opponentColor);
		const type = result ? result : 'move';
		this.makeMove(fromSquare, toSquare);
		this.saveMove(fromSquare, toSquare);
		return this.buildClientMessage(type, data.moveFrom, data.moveTo);
	}

	getBoard() {

		return this.board.map(row =>
			row.map(piece => piece ? piece.getNotation() : null)
		);
	}

	getData() {

		const data = {
			hostId: this.hostId,
			guestId: this.guestId,
			hostColor: this.hostColor,
			guestColor: this.guestColor,
			hostColorView: this.hostColorView,
			guestColorView: this.guestColorView,
			gameMode: this.gameMode,
			timeControl: this.timeControl,
			move: this.move,
			turn: this.turn,
			lastMoveFrom: this.lastMoveFrom,
			lastMoveTo: this.lastMoveTo,
			game: Array.from(this.game.entries()),
			board: this.board.map(row => row.map(piece => piece ? piece.clone() : null)),
		}
		return data;
	}

	clone() {

		const data = this.getData();
		const newBoard = new Chessboard(data);
		return newBoard;
	}
}
