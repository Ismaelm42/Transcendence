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
import { retrieveConnectedUsers, handleSocket, handleTextareaKeydown, handleFormSubmit } from './handleChat.js';
export default class Chat extends Step {
    render(appElement) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.username) {
                this.username = yield this.checkAuth();
            }
            try {
                const htmlContent = yield fetch("../html/chat.html");
                if (!htmlContent.ok) {
                    throw new Error("Failed to load the HTML file");
                }
                const htmlText = yield htmlContent.text();
                appElement.innerHTML = htmlText;
                const form = document.getElementById("chat-form");
                const textarea = document.getElementById("chat-textarea");
                const chatMessages = document.getElementById("chat-messages");
                const items = document.getElementById("item-container");
                const stored = sessionStorage.getItem("chatHTML") || "";
                if (stored) {
                    chatMessages.innerHTML = stored;
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }
                if (!Step.socket || Step.socket.readyState === WebSocket.CLOSED) {
                    Step.socket = new WebSocket("https://localhost:8443/back/ws/chat");
                }
                else {
                    retrieveConnectedUsers(Step.socket);
                }
                handleSocket(Step.socket, chatMessages, items, this.username);
                textarea.addEventListener('keydown', (e) => handleTextareaKeydown(e, form));
                form.addEventListener('submit', (e) => handleFormSubmit(e, textarea, Step.socket));
            }
            catch (error) {
                appElement.innerHTML = `<div id="pong-container">An error occurred while generating the content</div>`;
            }
        });
    }
}
// Caso raro cuando uno se loguea con la misma cuenta de un navegador diferente
// Aunque no hay fallo. Todo parece funcionar bien. Simplemente se actualiza el socket
