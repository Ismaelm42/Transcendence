import { Step } from '../spa/stepRender.js';
import { handleProfile } from './handleProfile.js';
import  Stat from '../stats/statsRender.js';

export default class Profile extends Step {
	async render(appElement: HTMLElement): Promise<void>  {
		console.log("En Profile render");
		try {

			if (!this.username) {
				this.username = await this.checkAuth();
			}
			console.log("Valor de user en render:", this.username);
			const usernameencode = this.username ? encodeURIComponent(this.username) : '';
			// const user = this.username;
			const url = `https://localhost:8443/back/get_user_by_username/?username=${this.username}`;
			const getUserResponse = await fetch(`${url}`, {
				method: "GET",
				credentials: "include"
			});

			
			if (!getUserResponse.ok) {
				throw new Error("Error al obtener el usuario");
			}
			const userData = await getUserResponse.json();
			const response = await fetch("../../html/profile/profile.html");
			if (!response.ok) throw new Error("Failed to load the HTML file");


			let htmlContent = await response.text();

			htmlContent = htmlContent.replace("{{ username }}", userData.username); // Ejemplo de reemplazo simple
			htmlContent = htmlContent.replace("{{ email }}", userData.email);
			htmlContent = htmlContent.replace("{{ avatarPath }}", userData.avatarPath);
			userData.tournamentUsername ? htmlContent = htmlContent.replace("{{ tournamentusername }}", userData.tournamentUsername) 
				: htmlContent = htmlContent.replace("{{ tournamentusername }}", userData.username);
			appElement.innerHTML =  htmlContent;
			handleProfile();
			// }
		} catch (error) {
			console.error("Error al renderizar la página de login:", error);
			appElement.innerHTML =  `<div id="pong-container">Ocurrió un error al generar el contenido</div>`;
		}
		const statContainer = document.getElementById("user-stats");
		if (statContainer) {
			try{
				const url = `https://localhost:8443/back/get_user_gamelogs`;
				const getUserResponse = await fetch(`${url}`, {
					method: "GET",
					credentials: "include"
				});
				if (!getUserResponse.ok) {
					throw new Error("Error retrieving stats");
					}
				const userStats = await getUserResponse.json();
				console.log("userStats:", userStats);
				if (userStats) {
					try{
						const response = await fetch("../../html/stats/userstats.html");
						if (!response.ok) throw new Error("Failed to load the HTML file");
						let htmlContent = await response.text();
						htmlContent = htmlContent
							.replace("{{ totalGames }}", userStats.totalGames.toString())
							.replace("{{ wins }}", userStats.wins.toString())
							.replace("{{ losses }}", userStats.losses.toString())
							.replace("{{ timePlayed }}", userStats.timePlayed.toString())
							.replace("{{ tournamentsPlayed }}", userStats.tournamentsPlayed.toString())
							.replace("{{ tournamentsWon }}", userStats.tournamentsWon.toString());
							statContainer.innerHTML =  htmlContent;
						}catch (error) {
							console.error("Error loading HTML file:", error);
							statContainer.innerHTML =  `<div id="pong-container">An error occurred while generating the content</div>`;
							}
						}
					} catch (error) {
						console.error("Error rendering Stats element:", error);
						statContainer.innerHTML =  `<div id="pong-container">An error occurred while generating the content</div>`;
					}
				}
	}
}

