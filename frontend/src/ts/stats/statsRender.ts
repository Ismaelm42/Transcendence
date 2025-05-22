import { Step } from '../spa/stepRender.js';
import { handleStats } from './handleStats.js'; 

export default class Stats extends Step {
	async render(appElement: HTMLElement): Promise<void>  {
		console.log("En Stats render");
		// Removed unused variable menuContainer
		if (!this.username) {
			this.username = await this.checkAuth();
		}
		console.log("Valor de user en Stats render:", this.username);
		// const usernameencode = this.username ? encodeURIComponent(this.username) : '';
			// const user = this.username;
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
				const response = await fetch("../../html/stats/stats.html");
				if (!response.ok) throw new Error("Failed to load the HTML file");

				let htmlContent = await response.text();
				htmlContent = htmlContent
					.replace("{{ totalGames }}", userStats.totalGames.toString())
					.replace("{{ wins }}", userStats.wins.toString())
					.replace("{{ losses }}", userStats.losses.toString())
					.replace("{{ timePlayed }}", userStats.timePlayed.toString())
					.replace("{{ tournamentsPlayed }}", userStats.tournamentsPlayed.toString())
					.replace("{{ tournamentsWon }}", userStats.tournamentsWon.toString());
				appElement.innerHTML =  htmlContent;
				handleStats(userStats);
				}catch (error) {
					console.error("Error loading HTML file:", error);
					appElement.innerHTML =  `<div id="pong-container">An error occurred while generating the content</div>`;
				}
			}
		} catch (error) {
			console.error("Error rendering Stats element:", error);
			appElement.innerHTML =  `<div id="pong-container">An error occurred while generating the content</div>`;
		}
	}
}








		// try {
		// 	console.log("En Stats Step render");
	
		// 	const user = await this.checkAuth();

		// 	if (user) {
		// 		// Retornar el contenido para usuarios autenticados
		// 		appElement.innerHTML = `
		// 				<div class="flex-grow flex flex-col items-center justify-center ">
		//    					<h1 class="text-4xl font-bold text-gray-800">Stats Step</h1>
		// 				</div>
		// 		`;
		// 		} else {	
		// 			// Retornar el contenido para usuarios no autenticados
		// 			appElement.innerHTML =  `
		// 				<div id="pong-container">
		// 					<div class="paddle left-paddle"></div>
		// 					<div class="ball"><img src="../img/bola.png" alt="Ball"></div>
		// 					<div class="paddle right-paddle"></div>
		// 				</div>
		// 			`;
		// 	}
		// } 
	
// 		catch (error) {
// 			console.error("Error en render:", error);
// 			appElement.innerHTML =  `<div id="pong-container">Ocurrió un error al generar el contenido</div>`;
// 		}
// 	}
// }
