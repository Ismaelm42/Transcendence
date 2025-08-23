import { Pawn, Knight, Bishop, Rook, Queen, King } from './chessPieceClass.js'

export class Chessboard {

	constructor(data) {

		this.hostId = data.hostId;
		this.guestId = data.guestId;
		this.hostName = data.hostName;
		this.guestName = data.guestName;
		this.hostElo = data.hostElo;
		this.guestElo = data.guestElo;
		this.hostImagePath = data.hostImagePath;
		this.guestImagePath = data.guestImagePath;
		this.hostColor = data.hostColor;
		this.guestColor = this.getGuestColor();
		this.hostColorView = data.hostColorView || this.hostColor;
		this.guestColorView = data.guestColorView || this.guestColor;
		this.move = data.move || 0;
		this.currentBoardMove = data.currentBoardMove || 0;
		this.turn = this.getTurn();
		this.lastMoveFrom = data.lastMoveFrom || null;
		this.lastMoveTo = data.lastMoveTo || null;
		this.allMovesFrom = data.allMovesFrom ? new Map(data.allMovesFrom) : new Map();
		this.allMovesTo = data.allMovesTo ? new Map(data.allMovesTo) : new Map();
		this.gameMode = data.gameMode;
		this.timeControl = data.timeControl;
		this.timeIncrement = this.setIncrement();
		this.intervalId = data.intervalId || null;
		this.interval = data.interval || null;
		this.hostTime = this.setTime();
		this.guestTime = this.setTime();
		this.timeOut = data.timeOut || null;
		this.mateType = data.mateType || null;
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
		this.whiteKing = this.findPiecesByType(King, 'white')[0];
		this.blackKing = this.findPiecesByType(King, 'black')[0];
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
		this.board[1][6] = new Pawn('black', 16);
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
		this.game.set(this.move++, this.board.map(row => row.map(piece => piece ? piece.clone() : null)));
		this.currentBoardMove = 0;
		this.allMovesFrom.set(0, null);
		this.allMovesTo.set(0, null);
		this.startTimer();
	}

	getGuestColor() {
		return (this.hostColor !== 'white') ? 'white' : 'black';
	}

	getTurn() {
		return (this.move % 2 !== 0) ? 'white' : 'black';
	}

	setTime() {
		return Number(this.timeControl.split('|')[0]) * 60 * 1000;
	}

	setIncrement() {
		return Number(this.timeControl.split('|')[1]) * 1000;
	}

	setPieceAt(square, piece) {

		const row = Math.floor(square / 10);
		const col = square % 10;
		this.board[row][col] = piece;
		piece.set(square);
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

	findPiecesByType(pieceType, color) {

		const result = [];

		for (let row = 0; row < this.board.length; row++) {
			for (let col = 0; col < this.board[row].length; col++) {
				const piece = this.board[row][col];
				if (piece instanceof pieceType && piece.getColor() === color) {
					result.push(piece);
				}
			}
		}
		return result;
	}

	getKing(color) {

		if (color === 'white')
			return this.whiteKing;
		return this.blackKing;
	}

	buildClientMessage(type, fromSquare, toSquare, notation, id) {

		const message = {
			type: type,
			moveFrom: fromSquare,
			moveTo: toSquare,
			lastMoveFrom: this.lastMoveFrom === null ? null : this.lastMoveFrom.toString().padStart(2, "0"),
			lastMoveTo: this.lastMoveTo === null ? null : this.lastMoveTo.toString().padStart(2, "0"),
			move: Math.floor(this.move / 2),
			color: this.getTurn() === 'white' ? 'black' : 'white',
			notation: notation,
			board: this.getBoard(),
		};
		if (type === 'checkmate' || (type === 'resignation' && this.gameMode === 'local')) {
			message.loser = this.getTurn() === this.hostColor ? this.hostName : this.guestName;
			message.winner = this.getTurn() === this.hostColor ? this.guestName : this.hostName;
		}
		if (type === 'resignation' && this.gameMode === 'online') {
			message.loser = id === this.hostId ? this.hostName : this.guestName;
			message.winner = id === this.hostId ? this.guestName : this.hostName;
		}
		return message;
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

	isCheck(fromSquare, toSquare, color) {

		const steps = Math.abs(toSquare - fromSquare);
		const row = Math.floor(fromSquare / 10);
		const col = fromSquare % 10;
		const isKing = this.board[row][col];

		if (isKing.getNotation()[1] === 'k' && isKing.castle === true && steps === 2)
			if (this.isCheck(fromSquare, fromSquare, color) || this.isCheck(fromSquare, fromSquare < toSquare ? fromSquare + 1 : fromSquare - 1, color))
				return true;

		const copy = this.clone();
		const board = copy.board;
		copy.makeMove(fromSquare, toSquare);
		copy.saveMove(fromSquare, toSquare);
		const kingPiece = copy.getKing(color);
		const square = kingPiece.getSquare();

		for (let row = 0; row < board.length; row++) {
			for (let col = 0; col < board[row].length; col++) {
				const piece = board[row][col];
				if (piece && piece.getColor() !== color) {
					if (piece.isLegalMove(piece.getSquare(), square, board, copy.lastMoveFrom, copy.lastMoveTo))
						return true;
				}
			}
		}
		return false;
	}

	isCheckMateOrStaleMate(fromSquare, toSquare, color) {

		const mateType = this.isCheck(fromSquare, toSquare, color) === true ? 'checkmate' : 'stalemate';

		const copy = this.clone()
		copy.makeMove(fromSquare, toSquare);
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

	startTimer() {

		if (this.getTurn() === this.hostColor)
			this.guestTime += this.timeIncrement;
		else
			this.hostTime += this.timeIncrement;

		this.interval = setInterval(() => {
			if (this.timeOut || this.hostTime <= 0 || this.guestTime <= 0) {
				this.timeOut = this.getTurn() === this.hostColor ? this.hostName : this.guestName;
				this.stopTimer();
				return;
			}
			if (this.getTurn() === this.hostColor)
				this.hostTime -= 100;
			else
				this.guestTime -= 100;
		}, 100);
	}

	stopTimer() {

		if (this.interval !== null) {
			clearInterval(this.interval);
			this.interval = null;
		}
	}

	updateTime(type) {

		if (type === 'checkmate' || type === 'stalemate' || type === 'agreement' || type === 'resignation')
			this.stopTimer();
		else {
			this.stopTimer();
			this.startTimer();
		}
	}

	saveMove(type, fromSquare, toSquare) {

		this.lastMoveFrom = fromSquare;
		this.lastMoveTo = toSquare;
		this.game.set(this.move, this.board.map(row => row.map(piece => piece ? piece.clone() : null)));
		this.move++;
		this.currentBoardMove = this.move - 1;
		this.allMovesFrom.set(this.move - 1, fromSquare);
		this.allMovesTo.set(this.move - 1, toSquare);
		this.turn = this.move % 2 === 0;
		if (type === 'checkmate' || type === 'stalemate')
			this.mateType = true;
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

	toAlgebraic(row, col) {
	
		const file = String.fromCharCode(97 + col);
		const rank = 8 - row;
		return file + rank;
	}

	getDisambiguation(pieceFrom, piecesType, toSquare, fromAlg) {

		let disambiguation = '';

		if (!(pieceFrom instanceof Pawn || pieceFrom instanceof King)) {

			const sameTargetPieces = piecesType.filter(p =>
				p !== pieceFrom && p.isLegalMove(p.getSquare(), toSquare, this.board, this.lastMoveFrom, this.lastMoveTo)
			);
			if (sameTargetPieces.length > 0) {

				const fromFile = fromAlg[0];
				const fromRank = fromAlg[1];

				const fileConflict = sameTargetPieces.some(p => {
					const square = p.getSquare();
					const alg = this.toAlgebraic(Math.floor(square / 10), square % 10);
					return alg[0] === fromFile;
				});

				const rankConflict = sameTargetPieces.some(p => {
					const square = p.getSquare();
					const alg = this.toAlgebraic(Math.floor(square / 10), square % 10);
					return alg[1] === fromRank;
				});

				if (fileConflict && rankConflict)
					disambiguation = fromAlg;
				else if (fileConflict)
					disambiguation = fromRank;
				else
					disambiguation = fromFile;
			}
		}
		return disambiguation;
	}

	getUnicode(notation) {

		const pieceUnicodeMap = {
			wk: '♔',
			wq: '♕',
			wr: '♖',
			wb: '♗',
			wn: '♘',
			wp: '♙',
			bk: '♚',
			bq: '♛',
			br: '♜',
			bb: '♝',
			bn: '♞',
			bp: '♟',
		};

		return notation.replace(/\b([wb][kqrbnp])/gi, (match) => {
			return pieceUnicodeMap[match];
		});
	}

	getNotation(fromSquare, toSquare, data, color, type) {

		const pieceFrom = this.getPieceAt(fromSquare);
		const pieceTo = this.getPieceAt(toSquare);
		const fromAlg = this.toAlgebraic(Math.floor(fromSquare / 10), fromSquare % 10);
		const toAlg = this.toAlgebraic(Math.floor(toSquare / 10), toSquare % 10);
		const suffix = type === 'check' ? '+' : type === 'checkmate' ? '++' : '';
		let notation = '';

		const piecesType = this.findPiecesByType(pieceFrom.constructor, color);
		const disambiguation = this.getDisambiguation(pieceFrom, piecesType, toSquare, fromAlg);

		if (pieceFrom instanceof King && pieceFrom.isKingSideCastle(fromSquare, toSquare, this.board))
			notation = ('O-O' + suffix);
		else if (pieceFrom instanceof King && pieceFrom.isQueenSideCastle(fromSquare, toSquare, this.board))
			notation = ('O-O-O' + suffix);
		else if (data.promoteTo)
			notation = pieceTo ? (fromAlg[0] + 'x' + toAlg + '=' + color[0] + data.promoteTo + suffix) : (toAlg + '=' + color[0] + data.promoteTo + suffix);
		else if (pieceFrom instanceof Pawn)
			notation = pieceTo ? (fromAlg[0] + 'x' + toAlg + suffix) : (toAlg + suffix);
		else
			notation = pieceTo ? (pieceFrom.getNotation() + disambiguation + 'x' + toAlg + suffix) : (pieceFrom.getNotation() + disambiguation + toAlg + suffix);
		
		return this.getUnicode(notation);
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
		const notation = this.getNotation(fromSquare, toSquare, data, color, type);
		this.makeMove(fromSquare, toSquare);
		this.saveMove(type, fromSquare, toSquare);
		this.updateTime(type);
		return this.buildClientMessage(type, data.moveFrom, data.moveTo, notation);
	}

	getBoard() {

		return this.board.map(row =>
			row.map(piece => piece ? piece.getNotation() : null)
		);
	}

	firstReplayMove() {

		this.currentBoardMove = 0;
		if (this.currentBoardMove === (this.move - 1))
			return true;
		return false;
	}

	previousReplayMove() {

		if ((this.move - 1) > 0 && this.currentBoardMove > 0)
			this.currentBoardMove--;
		if (this.currentBoardMove === (this.move - 1))
			return true;
		return false;
	}

	nextReplayMove() {

		if (this.currentBoardMove < (this.move - 1))
			this.currentBoardMove++;
		if (this.currentBoardMove === (this.move - 1))
			return true;
		return false;
	}

	lastReplayMove() {

		this.currentBoardMove = this.move - 1;
		return true;
	}

	getReplayBoard() {

		const replayBoard = this.game.get(this.currentBoardMove);
		return replayBoard.map(row =>
			row.map(piece => piece ? piece.getNotation() : null)
		);
	}

	getData() {

		const data = {
			hostId: this.hostId,
			guestId: this.guestId,
			hostName: this.hostName,
			guestName: this.guestName,
			hostElo: this.hostElo,
			guestElo: this.guestElo,
			hostImagePath: this.hostImagePath,
			guestImagePath: this.guestImagePath,
			hostColor: this.hostColor,
			guestColor: this.guestColor,
			hostColorView: this.hostColorView,
			guestColorView: this.guestColorView,
			move: this.move,
			currentBoardMove: this.currentBoardMove,
			turn: this.turn,
			lastMoveFrom: this.lastMoveFrom,
			lastMoveTo: this.lastMoveTo,
			allMovesFrom: Array.from(this.allMovesFrom.entries()),
			allMovesTo: Array.from(this.allMovesTo.entries()),
			gameMode: this.gameMode,
			timeControl: this.timeControl,
			timeIncrement: this.timeIncrement,
			intervalId: this.intervalId,
			hostTime: this.hostTime,
			guestTime: this.guestTime,
			timeOut: this.timeOut,
			mateType: this.mateType,
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
