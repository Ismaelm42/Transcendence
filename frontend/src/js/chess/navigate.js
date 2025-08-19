import { chessboard } from './state.js';
import { setupChessboard } from "./drawChessboard.js";
import { hideBoardOverlay, showBoardOverlay } from "./handleModals.js";
export function navigateReplay(data) {
    data.moveEnabled ? hideBoardOverlay() : showBoardOverlay();
    console.log("SETTEANDO");
    chessboard.set(data);
    setupChessboard(chessboard, null, null);
}
