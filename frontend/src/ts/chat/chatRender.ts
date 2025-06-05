import { Step } from '../spa/stepRender.js';
import { verifySocket } from './verifySocket.js';
import { filterSearchUsers } from './filterSearch.js';
import { handleSocketEvents } from './handleSocketEvents.js';
import { handleContentStorage } from './loadAndUpdateDOM.js';
import { removeNotificationChatTab } from './loadAndUpdateDOM.js';
import { getUserId, handleFormSubmit, handlePrivateMsg, showPrivateChat } from './handleSenders.js';

export default class Chat extends Step {

	async render(appElement: HTMLElement): Promise<void> {
		if (!this.username) {
			this.username = await this.checkAuth();
		}
		sessionStorage.setItem("current-view", "Chat");
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
			const items = document.getElementById("user-item-container") as HTMLDivElement;
			const searchInput = document.getElementById("search-users-input") as HTMLInputElement;
			const recentChats = document.getElementById("chat-item-list-container") as HTMLDivElement;
			const userId = await getUserId(this.username!);
			console.log(this.username!);

			removeNotificationChatTab();
			handleContentStorage(chatMessages, recentChats, userId);
			Step.socket = verifySocket(Step.socket);
			handleSocketEvents(Step.socket!, chatMessages, recentChats, userId);
			textarea.addEventListener('keydown', e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), form.requestSubmit()));
			form.addEventListener('submit', (e) => handleFormSubmit(e, textarea, Step.socket!));
			searchInput.addEventListener('keydown', e => e.key === 'Enter' && e.preventDefault());
			searchInput.addEventListener('input', () => filterSearchUsers(searchInput.value));
			items.addEventListener('dblclick', (e) => handlePrivateMsg(e, Step.socket!));
			recentChats.addEventListener('click', (e) => showPrivateChat(e, Step.socket!, recentChats, userId));
		}
		catch (error) {
			appElement.innerHTML = `<div id="pong-container">An error occurred while generating the content</div>`;
		}
	}
}

// GESTIONAR EN EL BACKEND EL CASO DE QUE UN USUARIO SE DESCONECTE. ELIMINAR DEL ARRAY DE PRIVADOS.

// Problema con la recarga de la página, se actualizan los contactos demasiadas veces y parpadea la foto, el hover y la luz del chat. Ver si se puede solucioanr.

// Problema con el username como identificador de usuario cuando se cambia el nombre de usuario.
