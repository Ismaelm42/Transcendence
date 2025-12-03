import { Step } from '../spa/stepRender.js';
import { SPA } from '../spa/spa.js';
import { verifySocket } from './verifySocket.js';
import { filterSearchUsers } from './filterSearch.js';
import { handleSocketEvents } from './handleSocketEvents.js';
import { handleContentStorage } from './loadAndUpdateDOM.js';
import { showUserOptionsMenu } from './handleUserOptionsMenu.js';
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

			removeNotificationChatTab();
			handleContentStorage(chatMessages, recentChats, userId);
			Step.chatSocket = verifySocket(Step.chatSocket);
			handleSocketEvents(Step.chatSocket!, chatMessages, recentChats, userId);
			textarea.addEventListener('keydown', e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), form.requestSubmit()));
			form.addEventListener('submit', (e) => handleFormSubmit(e, textarea, Step.chatSocket!));
			searchInput.addEventListener('keydown', e => e.key === 'Enter' && e.preventDefault());
			searchInput.addEventListener('input', () => filterSearchUsers(searchInput.value));
			items.addEventListener('dblclick', (e) => handlePrivateMsg(e, Step.chatSocket!));
			recentChats.addEventListener('click', (e) => showPrivateChat(e, Step.chatSocket!, userId));

			items.addEventListener("click", async (event) => {
				const target = event.target as HTMLElement;
				const userItem = target.closest(".item") as HTMLDivElement;
				if (!userItem) return;

				const usernameSpan = userItem.querySelector("span.text-sm");
				const clickedUsername = usernameSpan?.textContent?.trim();
				const userId = await getUserId(this.username!);
				const clickedUserId = await getUserId(clickedUsername!);
				if (clickedUserId && clickedUserId !== userId) {
					showUserOptionsMenu(userItem, event as MouseEvent, Step.chatSocket!, userId);
				}
			});

			chatMessages.addEventListener('click', (e) => {
			const target = e.target as HTMLElement;
			const action = target.getAttribute('data-action');
			if (action === 'accept-invite') {
				const gameId = target.getAttribute('data-game-id');
				if (gameId) {
					// Save state to sessionStorage
					const inviteStates = JSON.parse(sessionStorage.getItem("invite-states") || "{}");
					inviteStates[gameId] = 'accepted';
					sessionStorage.setItem("invite-states", JSON.stringify(inviteStates));
					
					// Update the card UI immediately
					const card = target.closest('.invite-card') as HTMLElement;
					if (card) {
						card.innerHTML = `
							<p class="text-green-400 font-semibold">Game accepted</p>
						`;
						card.className = 'invite-card p-3 md:p-4 bg-gray-900/60 rounded-lg border border-green-500/40 shadow-sm backdrop-blur';
					}
					
					// Join the game
					const spa = SPA.getInstance();
					if (spa.currentGame) {
						spa.currentGame.isChatGame = true;
						spa.currentGame.isJoining = true;
						spa.currentGame.setGameMode('remote');
						spa.currentGame.setGameIsHost(false);
						spa.currentGame.getGameConnection().joinGame(gameId);
					}
				}
			} else if (action === 'ignore-invite') {
				const gameId = target.getAttribute('data-game-id');
				if (gameId && Step.chatSocket && Step.chatSocket.readyState === WebSocket.OPEN) {
					// Save state to sessionStorage
					const inviteStates = JSON.parse(sessionStorage.getItem("invite-states") || "{}");
					inviteStates[gameId] = 'declined';
					sessionStorage.setItem("invite-states", JSON.stringify(inviteStates));
					
					// Update the card UI immediately
					const card = target.closest('.invite-card') as HTMLElement;
					if (card) {
						card.innerHTML = `
							<p class="text-gray-400 font-semibold">Game declined</p>
						`;
						card.className = 'invite-card p-3 md:p-4 bg-gray-900/60 rounded-lg border border-gray-500/40 shadow-sm backdrop-blur';
					}
					
					// Send decline message to backend
					Step.chatSocket.send(JSON.stringify({
						type: 'DECLINE_GAME_INVITE',
						gameId: gameId
					}));
				}
			}
		});
		}
		catch (error) {
			console.log(error);
			appElement.innerHTML = `<div id="pong-container">An error occurred while generating the content</div>`;
		}
	}
}
