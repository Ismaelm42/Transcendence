import { Step } from './stepRender.js';

export default class Profile extends Step {
	async render(): Promise<string> {
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
			if (userData) {
				console.log( 'username: ',userData.username);
				console.log( 'email: ' , userData.email);
				console.log( 'pass: ', userData.password);
				console.log( 'avatar:' ,userData.avatarPath);
				console.log( 'pass: ', userData.password);
				console.log( 'last Login: ',userData.lastLogin);
			}
			// console.log("Valor de user en getUserResponse:", getUserResponse);

			const response = await fetch("../html/profile.html");
			if (!response.ok) throw new Error("Failed to load the HTML file");


			let htmlContent = await response.text();

			htmlContent = htmlContent.replace("{{ username }}", userData.username); // Ejemplo de reemplazo simple
			htmlContent = htmlContent.replace("{{ email }}", userData.email);
			htmlContent = htmlContent.replace("{{ avatarPath }}", userData.avatarPath);

			// if (this.container && htmlContent) {
			// 	this.container.innerHTML = htmlContent;
	
				// Esperar un breve tiempo antes de asignar eventos
				// requestAnimationFrame(async () => {
				// 	const form = this.container.querySelector("form");
					// if (form) {
					// 	try {
					// 		const { handleLoginSubmit } = await import('./handleLoginSubmit.js');
					// 		form.addEventListener("submit", async (event) => {
					// 			event.preventDefault();
					// 			console.log("Se ha pulsado handleLoginSubmit:", event);
					// 			handleLoginSubmit(event);
					// 		});
					// 	} catch (err) {
					// 		console.error("Error al importar handleLoginSubmit.js:", err);
					// 	}
					// }
	
					// Configurar evento para el botón de registro
					// const signUp = this.container.querySelector("#signUp");
					// if (signUp) {
					// 	signUp.addEventListener("click", async () => {
					// 		try {
					// 			const { default: RegisterRender } = await import('./registerRender.js');
					// 			const registerInstance = new RegisterRender('app-container');
					// 			await registerInstance.render();
					// 		} catch (err) {
					// 			console.error("Error al importar registerRender.js:", err);
					// 		}
					// 	});
					// }
				// });
	
				return htmlContent;
			// }
		} catch (error) {
			console.error("Error al renderizar la página de login:", error);
			return `<div id="pong-container">Ocurrió un error al generar el contenido</div>`;
		}
		return "";
	}
}

