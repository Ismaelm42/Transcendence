import { Step } from './stepRender.js';
import { handleSocket, handleTextareaKeydown, handleFormSubmit} from './handleChat.js';

export default class Chat extends Step {
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
			const socket = handleSocket(chatMessages, this.username? this.username : "Undefined");
			textarea.addEventListener('keydown', (e) => handleTextareaKeydown(e, form));
			form.addEventListener('submit', (e) => handleFormSubmit(e, textarea, socket));
		}
		catch (error) {
				appElement.innerHTML = `<div id="pong-container">An error occurred while generating the content</div>`;
			}
		}
}
