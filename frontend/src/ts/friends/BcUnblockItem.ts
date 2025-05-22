import { BasicComponent } from './BasicComponent.js';
import { showMessage } from '../modal/showMessage.js';
import { searchUsersFriends } from './friendsSearchUsers.js';

export class BcUnblockItem extends BasicComponent {
  constructor() {
    super('../../html/friends/BcUnblockItem.html', () => {
      this.bindEvents();
    });
  }

  private bindEvents() {
    const btn = this.el?.querySelector('.btnUnblockItem');
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
	        const response = await fetch("https://localhost:8443/back/unblock_user", {
	            method: "POST",
	            credentials: 'include',	
	            headers: {
	                "Content-Type": "application/json",
	            	},
	            	body: JSON.stringify(requestBody),
	        	});
			if (response.ok) {
				showMessage(`User unblocked successfully:`, null);
				searchUsersFriends('codigo');
			}
			else {
				const errorMessage = await response.json();
				showMessage(errorMessage.error, null);
			}	
		} catch (error) {	
			console.error("Error unblocking user");
			}
		});
  }
}
