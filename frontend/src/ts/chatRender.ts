import { Step } from './stepRender.js';
import { handleSocket, handleTextareaKeydown, handleFormSubmit} from './handleChat.js';

export default class Chat extends Step {
	private socket: WebSocket | null = null;

	async render(appElement: HTMLElement): Promise<void> {
		if (!this.username) {
			this.username = await this.checkAuth();
		}
		try {
			const htmlContent = await fetch("../html/chat.html");
			if (!htmlContent.ok) {
				throw new Error("Failed to load the HTML file");
			}
			const htmlText = await htmlContent.text();
			appElement.innerHTML = htmlText;
			const form = document.getElementById("chat-form") as HTMLFormElement;
			const textarea = document.getElementById("chat-textarea") as HTMLTextAreaElement;
			const chatMessages = document.getElementById("chat-messages") as HTMLDivElement;
			const items = document.getElementById("item-container") as HTMLDivElement;
			const stored = sessionStorage.getItem("chatHTML") || "";
			if (stored) {
				chatMessages.innerHTML = stored;
				chatMessages.scrollTop = chatMessages.scrollHeight;
			}
			if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
				this.socket = new WebSocket("https://localhost:8443/back/ws/chat");
			}
			handleSocket(this.socket, chatMessages, items, this.username? this.username : "Undefined");
			textarea.addEventListener('keydown', (e) => handleTextareaKeydown(e, form));
			form.addEventListener('submit', (e) => handleFormSubmit(e, textarea, this.socket!));
			}
		catch (error) {
				appElement.innerHTML = `<div id="pong-container">An error occurred while generating the content</div>`;
			}
		}
}



// Caso raro cuando uno se loguea con la misma cuenta de un navegador diferente
// Aunque no hay fallo. Todo parece funcionar bien. Simplemente se actualiza el socket
