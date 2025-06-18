"use strict";
class Position {
    constructor(pos) {
        this.x = pos.charCodeAt(0) - 'a'.charCodeAt(0);
        this.y = parseInt(pos[1], 10);
        this.alg = pos;
    }
}
class ChessPiece {
    constructor(color, position) {
        this.color = color;
        this.position = position;
    }
}
class Pawn extends ChessPiece {
    getLegalMoves(board) {
        return [];
    }
}
class Knight extends ChessPiece {
    getLegalMoves(board) {
        return [];
    }
}
class Bishop extends ChessPiece {
    getLegalMoves(board) {
        return [];
    }
}
class Rook extends ChessPiece {
    getLegalMoves(board) {
        return [];
    }
}
class Queen extends ChessPiece {
    getLegalMoves(board) {
        return [];
    }
}
class King extends ChessPiece {
    getLegalMoves(board) {
        return [];
    }
}
class Board {
    constructor() {
        this.chessBoard = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null));
    }
}
