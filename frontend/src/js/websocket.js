"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const playButton = document.getElementById("playButton");
function WebsocketTest() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Button pushed");
        const socket = new WebSocket("https://localhost:8443/back/chat");
        socket.onopen = () => {
            console.log("CLIENT: Connected to Websocket-server");
            socket.send("Hi server!");
        };
        socket.onmessage = (event) => {
            console.log("CLIENT: Message from server:", event.data);
        };
        socket.onclose = (event) => {
            console.log(`CLIENT: Connection closed - Code: ${event.code}, Reason: ${event.reason}`);
        };
        socket.onerror = (event) => {
            console.error("CLIENT: WebSocket error:", event);
        };
    });
}
document.addEventListener("DOMContentLoaded", () => {
    playButton === null || playButton === void 0 ? void 0 : playButton.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
        yield WebsocketTest();
    }));
});
