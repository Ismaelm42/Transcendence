import { BasicComponent } from './BasicComponent.js';
import { showMessage } from '../modal/showMessage.js';
import { searchUsersFriends } from './friendsSearchUsers.js';
import { renderRelations } from './renderRelations.js';
import { currentUserId } from  './friendsRender.js';

export class BcAddFriend extends BasicComponent {
	constructor() {
		super('../../html/friends/BcAddfriendItem.html', () => {
			this.bindEvents();
		});
	}

	private bindEvents() {
		const btn = this.el?.querySelector('.btnAddfriend');
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
				const response = await fetch("https://localhost:8443/back/send_friend_request", {
					method: "POST",
					credentials: 'include',
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(requestBody),
				});
				if (response.ok) {
					showMessage(`Friend request sent successfully:`, null);
					searchUsersFriends('codigo');
					
					const relationsContainer = document.getElementById('relations-container');
				}
				else {
					const errorMessage = await response.json();
					showMessage(errorMessage.error, null);
				}
			} catch (error) {
				console.error("Error sending friend request");
			}
		});
	}
}
