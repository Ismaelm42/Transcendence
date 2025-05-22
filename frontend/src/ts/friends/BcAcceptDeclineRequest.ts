import { BasicComponent } from './BasicComponent.js';
import { showMessage } from '../modal/showMessage.js';
import { searchUsersFriends } from './friendsSearchUsers.js';

export class BcAcceptDeclineRequest extends BasicComponent {
  constructor() {
    super('../../html/friends/BcAcceptDeclineRequest.html', () => {
      this.bindEvents();
    });
  }

  private bindEvents() {
    const btn = this.el?.querySelector('.btnAcceptRequest ');
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
	        const response = await fetch("https://localhost:8443/back/accept_friend_request", {
	            method: "POST",
	            credentials: 'include',	
	            headers: {
	                "Content-Type": "application/json",
	            	},
	            	body: JSON.stringify(requestBody),
	        	});
			if (response.ok) {
				showMessage(`Friend added successfully:`, null);
				searchUsersFriends('codigo');
			}
			else {
				const errorMessage = await response.json();
				showMessage(errorMessage.error, null);
			}	
		} catch (error) {	
			console.error("Error accepting friend request");
			}
		});
	const btn2 = this.el?.querySelector('.btnDeclineRequest ');
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
	        const response = await fetch("https://localhost:8443/back/reject_friend_request", {
	            method: "POST",
	            credentials: 'include',	
	            headers: {
	                "Content-Type": "application/json",
	            	},
	            	body: JSON.stringify(requestBody),
	        	});
			if (response.ok) {
				showMessage(`Friend request declined successfully:`, null);
				searchUsersFriends('codigo');
			}
			else {
				const errorMessage = await response.json();
				showMessage(errorMessage.error, null);
			}	
		} catch (error) {	
			console.error("Error declining friend request");
			}
		});	
  }
}
