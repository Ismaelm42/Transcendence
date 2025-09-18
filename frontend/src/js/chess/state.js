var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Step } from '../spa/stepRender.js';
import { Chessboard } from './chessboardClass.js';
export let userId = null;
export let socket = null;
export let chessboard = null;
export let canvas = null;
export let appContainer = null;
export let data = null;
export function setAppContainer(appElement) {
    appContainer = appElement;
}
export function setUserId(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = yield fetch("https://localhost:8443/back/getIdByUsername", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: username
            }),
        });
        if (!id.ok)
            throw new Error("Failed to fetch user ID");
        userId = yield id.text();
    });
}
export function setSocket() {
    if (!Step.chessSocket || Step.chessSocket.readyState === WebSocket.CLOSED) {
        Step.chessSocket = new WebSocket("https://localhost:8443/back/ws/chess");
        socket = Step.chessSocket;
    }
    else
        socket = Step.chessSocket;
}
export function setChessboard(data) {
    chessboard = new Chessboard(data);
}
export function setCanvas() {
    const board = document.getElementById("board");
    canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    board.insertBefore(canvas, board.firstChild);
}
export function setData(newData) {
    data = newData;
}
