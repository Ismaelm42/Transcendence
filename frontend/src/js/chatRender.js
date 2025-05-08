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
function getTimeStamp() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
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
function initWebsocket() {
    return __awaiter(this, void 0, void 0, function* () {
        const socket = new WebSocket("wss://localhost:8443/back/chat");
        socket.onopen = () => {
            console.log("NEW CLIENT CONNECTED");
        };
        socket.onmessage = (event) => {
            console.log("CLIENT MESSAGE:", event.data);
        };
        socket.onclose = (event) => {
            console.log(`CLIENT CONNECTION CLOSED - Code: ${event.code}, Reason: ${event.reason}`);
        };
        socket.onerror = (event) => {
            console.error("WEBSOCKET ERROR:", event);
        };
        return socket;
    });
}
export default class Chat extends Step {
    render(appElement) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.username) {
                this.username = yield this.checkAuth();
            }
            try {
                const socket = new WebSocket("https://localhost:8443/back/ws/chat");
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
                const htmlContent = yield formatMessage("https://localhost:8443/back/images/default-avatar.png", "Ismael", "Hey, how are you? Is everything fine! I'm testing this with a very very very very very very very very very very very long message.", "sent");
                appElement.innerHTML = htmlContent;
                const form = document.getElementById("chat-form");
                const textarea = document.getElementById("chat-textarea");
                textarea.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        form.requestSubmit();
                    }
                });
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const message = textarea.value.trim();
                    if (message) {
                        socket.send(message);
                        textarea.value = '';
                    }
                });
            }
            catch (error) {
                appElement.innerHTML = `<div id="pong-container">An error occurred while generating the content</div>`;
            }
        });
    }
}
