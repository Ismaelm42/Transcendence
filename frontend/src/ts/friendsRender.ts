import { Step } from './stepRender.js';
import { searchUsersFriends } from './searchUsersFriends.js';

export default class Friends extends Step {
	
	async render(appElement: HTMLElement): Promise<void>  {
		console.log("En Friend render");
		if (!this.username) {
			this.username = await this.checkAuth();
		}
		
		try
		{
			const response = await fetch("../html/friends.html");
			if (!response.ok) throw new Error("Failed to load the HTML file");

			let htmlContent = await response.text();
			appElement.innerHTML =  htmlContent;
			
			const btnSearch =  document.getElementById("btnSearch");
			if (btnSearch) {
				btnSearch.addEventListener("click", searchUsersFriends);
			}
			// const searchTableTemplate = await fetch("../html/search_table.html");
			// if (!searchTableTemplate.ok) throw new Error("Failed to load the HTML file");
			// else 
			// {
			// 	const searchMainContainer = document.getElementById("search-main-container");
			// 	let searchTableContent = await searchTableTemplate.text();
			// 	if (searchMainContainer && searchTableContent) {
			// 		searchMainContainer.innerHTML += searchTableContent;
			// 	}
			// 	const btnSearch =  document.getElementById("btnSearch");
			// 	if (btnSearch) {
			// 		searchUsersFriends(btnSearch as HTMLElement);
			// 	}
			// }

			// handleStats(userStats);
		}catch (error) {
				console.error("Error loading HTML file:", error);
				appElement.innerHTML =  `<div id="pong-container">An error occurred while generating the content</div>`;
		}
	}
}