import { Step } from '../spa/stepRender.js';
import { handleProfile } from './handleProfile.js';
import  Stat from '../stats/statsRender.js';
import {formatTimeFromMilliseconds} from '../stats/getStats.js';

export default class Profile extends Step {
	async render(appElement: HTMLElement): Promise<void>  {
		sessionStorage.setItem("current-view", "Profile");
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
		const statContainer = document.getElementById("user-pong-stats");
		const chessstatContainer = document.getElementById("user-chess-stats");

		if (statContainer) {
			try{
				const url = `https://localhost:8443/back/get_user_gamelogs`;
				const chessurl = `https://localhost:8443/back/get_user_chessgamelogs`;

				const getUserResponse = await fetch(`${url}`, {
					method: "GET",
					credentials: "include"
				});

				const getChessUserResponse = await fetch(`${chessurl}`, {
					method: "GET",
					credentials: "include"
				});

				if (!getUserResponse.ok) {
					throw new Error("Error retrieving stats");
					}
				if (!getChessUserResponse.ok) {
					throw new Error("Error retrieving chess stats");
				}

				const userStats = await getUserResponse.json();
				const chessUserStats = await getChessUserResponse.json();
					if (userStats && chessUserStats && statContainer && chessstatContainer) {
						try{
							const response = await fetch("../../html/stats/userstats.html");
							const chessresponse = await fetch("../../html/stats/userChessstats.html");
							if (!response.ok || !chessresponse.ok) throw new Error("Failed to load the HTML file");
							let htmlContent = await response.text();
							let chesshtmlContent = await chessresponse.text();
							htmlContent = htmlContent
								.replace("{{ totalGames }}", userStats.totalGames.toString())
								.replace("{{ wins }}", userStats.wins.toString())
								.replace("{{ losses }}", userStats.losses.toString())
								.replace("{{ timePlayed }}", (formatTimeFromMilliseconds(userStats.timePlayed)).toString())
								.replace("{{ tournamentsPlayed }}", userStats.tournamentsPlayed.toString())
								.replace("{{ winsInTournaments }}", userStats.winsInTournaments.toString());
							statContainer.innerHTML =  htmlContent;
							chesshtmlContent = chesshtmlContent
								.replace("{{ totalGames }}", chessUserStats.totalGames.toString())
								.replace("{{ wins }}", chessUserStats.wins.toString())
								.replace("{{ losses }}", chessUserStats.losses.toString())
								.replace("{{ draws }}", chessUserStats.draws.toString());
							chessstatContainer.innerHTML =  chesshtmlContent;	
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

