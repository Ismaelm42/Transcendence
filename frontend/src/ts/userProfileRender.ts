import { Step } from './stepRender.js';
import { handleProfile } from './handleProfile.js';

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
			// console.log("userData:", userData);
			// if (userData) {
			// 	console.log( 'username: ',userData.username);
			// 	console.log( 'email: ' , userData.email);
			// 	console.log( 'pass: ', userData.password);
			// 	console.log( 'avatar:' ,userData.avatarPath);
			// 	console.log( 'pass: ', userData.password);
			// 	console.log( 'last Login: ',userData.lastLogin);
			// }
			// console.log("Valor de user en getUserResponse:", getUserResponse);

			const response = await fetch("../html/profile.html");
			if (!response.ok) throw new Error("Failed to load the HTML file");


			let htmlContent = await response.text();

			htmlContent = htmlContent.replace("{{ username }}", userData.username); // Ejemplo de reemplazo simple
			htmlContent = htmlContent.replace("{{ email }}", userData.email);
			htmlContent = htmlContent.replace("{{ avatarPath }}", userData.avatarPath);
			userData.tournamentUserName ? htmlContent = htmlContent.replace("{{ tournamentusername }}", userData.tournamentUserName) 
				: htmlContent = htmlContent.replace("{{ tournamentusername }}", userData.username);
			appElement.innerHTML =  htmlContent;
			handleProfile();
			// }
		} catch (error) {
			console.error("Error al renderizar la página de login:", error);
			appElement.innerHTML =  `<div id="pong-container">Ocurrió un error al generar el contenido</div>`;
		}
	}
}

