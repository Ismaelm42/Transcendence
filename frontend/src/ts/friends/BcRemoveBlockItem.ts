import { BasicComponent } from './BasicComponent.js';
import { showMessage } from '../modal/showMessage.js';
import { searchUsersFriends } from './friendsSearchUsers.js';

export class BcRemoveBlockItem extends BasicComponent {
  constructor() {
    super('../../html/friends/BcRemoveBlockItem.html', () => {
      this.bindEvents();
    });
  }

  private bindEvents() {
    const btn = this.el?.querySelector('.btnRemoveFriend');
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
			console.log("En BcRemoveBlockItem");
			console.log("btn:", btn);
	        const response = await fetch("https://localhost:8443/back/delete_friend", {
	            method: "POST",
	            credentials: 'include',	
	            headers: {
	                "Content-Type": "application/json",
	            	},
	            	body: JSON.stringify(requestBody),
	        	});
			if (response.ok) {
				showMessage(`Friend removed successfully:`, null);
				searchUsersFriends('codigo');
			}
			else {
				const errorMessage = await response.json();
				showMessage(errorMessage.error, null);
			}	
		} catch (error) {	
			console.error("Error removing friend request");
			}
		});
	const btn2 = this.el?.querySelector('.btnBlockItem');
    btn2?.addEventListener('click', async (e) => {
		const btn2 = e.currentTarget as HTMLElement;
		const wrapper = btn2.closest('div.flex');
		if (!wrapper) return;
		const span = wrapper.querySelector('span[data-user-id]');
		if (!span) return;
		const userId = span.textContent?.trim();
		console.log('ID del usuario:', userId);
		const requestBody = {
			friendId: userId
		};
      try {
			console.log("En BcRemoveBlockItem");
			console.log("btn:", btn);
	        const response = await fetch("https://localhost:8443/back/block_user", {
	            method: "POST",
	            credentials: 'include',	
	            headers: {
	                "Content-Type": "application/json",
	            	},
	            	body: JSON.stringify(requestBody),
	        	});
			if (response.ok) {
				showMessage(`Friend blocked successfully:`, null);
				searchUsersFriends('codigo');
			}
			else {
				const errorMessage = await response.json();
				showMessage(errorMessage.error, null);
			}	
		} catch (error) {	
			console.error("Error blocking friend");
			}
		});
  }
}
