import { Step } from '../spa/stepRender.js';
import { retrieveConnectedUsers, handleSocket, handleTextareaKeydown, handleFormSubmit, filterSearchUsers} from './handleChat.js';

export default class Chat extends Step {

	async render(appElement: HTMLElement): Promise<void> {
		if (!this.username) {
			this.username = await this.checkAuth();
		}
		try {
				const htmlContent = await fetch("../../html/chat/chat.html");
				if (!htmlContent.ok) {
					throw new Error("Failed to load the HTML file");
				}
				const htmlText = await htmlContent.text();
				appElement.innerHTML = htmlText;
				const form = document.getElementById("chat-form") as HTMLFormElement;
				const textarea = document.getElementById("chat-textarea") as HTMLTextAreaElement;
				const chatMessages = document.getElementById("chat-messages") as HTMLDivElement;
				const items = document.getElementById("item-container") as HTMLDivElement;
				const searchInput = document.getElementById("search-input") as HTMLInputElement;
				const stored = sessionStorage.getItem("chatHTML") || "";
				if (stored) {
					chatMessages.innerHTML = stored;
					chatMessages.scrollTop = chatMessages.scrollHeight;
				}
				if (!Step.socket || Step.socket.readyState === WebSocket.CLOSED) {
					console.log("new socket");
					Step.socket = new WebSocket("https://localhost:8443/back/ws/chat");
				}
				else {
					retrieveConnectedUsers(Step.socket);
				}
				handleSocket(Step.socket, chatMessages, items, this.username!);
				textarea.addEventListener('keydown', (e) => handleTextareaKeydown(e, form));
				form.addEventListener('submit', (e) => handleFormSubmit(e, textarea, Step.socket!));
				searchInput.addEventListener('keydown', e => e.key === 'Enter' && e.preventDefault());
                searchInput.addEventListener('input', () => filterSearchUsers(searchInput.value));
			}
		catch (error) {
				appElement.innerHTML = `<div id="pong-container">An error occurred while generating the content</div>`;
			}
		}
}
