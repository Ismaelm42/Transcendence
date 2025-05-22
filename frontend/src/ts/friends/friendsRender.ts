import { Step } from '../spa/stepRender.js';
import { searchUsersFriends } from './friendsSearchUsers.js';

export default class Friends extends Step {
	
	async render(appElement: HTMLElement): Promise<void>  {
		console.log("En Friend render");
		if (!this.username) {
			this.username = await this.checkAuth();
		}
		try
		{
			const response = await fetch("../../html/friends/friends.html");
			if (!response.ok) throw new Error("Failed to load the HTML file");

			let htmlContent = await response.text();
			appElement.innerHTML =  htmlContent;
			
			let btnSearch =  document.getElementById("btnSearch");
			while (!btnSearch) {
				await new Promise(resolve => setTimeout(resolve, 100)); // Wait for 100ms
				btnSearch = document.getElementById("btnSearch");
			}
				btnSearch.addEventListener("click", (event) => searchUsersFriends('boton', event));
		}catch (error) {
				console.error("Error loading HTML file:", error);
				appElement.innerHTML =  `<div id="pong-container">An error occurred while generating the content</div>`;
		}
	}
}
