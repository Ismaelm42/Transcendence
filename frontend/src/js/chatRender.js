var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Step } from './stepRender.js';
import { getTimeStamp, handleChat } from './handleChat.js';
function initWebsocket() {
    return __awaiter(this, void 0, void 0, function* () {
        const socket = new WebSocket("https://localhost:8443/back/chat");
        socket.onopen = () => {
            console.log("New client connected");
        };
        socket.onmessage = (event) => {
            console.log("Client message:", event.data);
        };
        socket.onclose = (event) => {
            console.log(`Client connection closed - Code: ${event.code}, Reason: ${event.reason}`);
        };
        socket.onerror = (event) => {
            console.error("Websocket error:", event);
        };
        return socket;
    });
}
function formatMessage(imagePath, username, message, messageStatus) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch("../html/chat.html");
        if (!response.ok) {
            throw new Error("Failed to load the HTML file");
        }
        let htmlContent = yield response.text();
        htmlContent = htmlContent
            .replace("{{ image }}", imagePath)
            .replace("{{ usernameImage }}", username ? username : "Guest")
            .replace("{{ username }}", username ? username : "Guest")
            .replace("{{ timeStamp }}", getTimeStamp())
            .replace("{{ message }}", message)
            .replace("{{ messageStatus }}", messageStatus);
        return htmlContent;
    });
}
export default class Chat extends Step {
    render(appElement) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.username) {
                this.username = yield this.checkAuth();
            }
            try {
                const socket = yield initWebsocket();
                const htmlContent = yield formatMessage("https://localhost:8443/back/images/default-avatar.png", "Ismael", "Hello, world!", "sent");
                appElement.innerHTML = htmlContent;
                handleChat();
            }
            catch (error) {
                appElement.innerHTML = `<div id="pong-container">An error occurred while generating the content</div>`;
            }
        });
    }
}
