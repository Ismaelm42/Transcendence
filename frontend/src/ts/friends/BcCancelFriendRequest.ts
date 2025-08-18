import { BasicComponent } from './BasicComponent.js';
import { searchUsersFriends } from './friendsSearchUsers.js';
import { showMessage } from '../modal/showMessage.js';
import { renderRelations } from './renderRelations.js';
import { currentUserId } from './friendsRender.js';

export class BcCancelFriendRequest extends BasicComponent {
	constructor() {
		super('../../html/friends/BcCancelFriendRequest.html', () => {
			this.bindEvents();
		});
	}

	private bindEvents() {
		const btn = this.el?.querySelector('.btnCancelFriendRequest');
		btn?.addEventListener('click', async (e) => {
			const btn = e.currentTarget as HTMLElement;
			const wrapper = btn.closest('div.flex');
			if (!wrapper) return;
			const span = wrapper.querySelector('span[data-user-id]');
			if (!span) return;
			const userId = span.textContent?.trim();
			console.log('ID del usuario:', userId);
			const requestBody = {
				friendId: userId
			};
			try {
				const response = await fetch("https://localhost:8443/back/delete_friend", {
					method: "POST",
					credentials: 'include',
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(requestBody),
				});
				if (response.ok) {
					showMessage(`Friend request Cancelled successfully:`, null);
					searchUsersFriends('codigo');
					const relationsContainer = document.getElementById('relations-container');
					//await renderRelations(relationsContainer!, currentUserId!);
				}
				else {
					const errorMessage = await response.json();
					showMessage(errorMessage.error, null);
				}
			} catch (error) {
				console.error("Error cancelling friend request");
			}
		});
	}
}
