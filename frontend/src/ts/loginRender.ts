import { Step } from './stepRender.js';

export default class LoginRender extends Step {

	async render(): Promise<string> {
		console.log("En login render");
		try {
			const response = await fetch("../html/login.html");
			if (!response.ok) throw new Error("Failed to load the HTML file");
	
			const htmlContent = await response.text();
			if (this.container && htmlContent) {
				this.container.innerHTML = htmlContent;
	
				// Esperar un breve tiempo antes de asignar eventos
				requestAnimationFrame(async () => {
					const form = this.container.querySelector("form");
					if (form) {
						try {
							const { handleLoginSubmit } = await import('./handleLoginSubmit.js');
							form.addEventListener("submit", async (event) => {
								event.preventDefault();
								console.log("Se ha pulsado handleLoginSubmit:", event);
								handleLoginSubmit(event);
							});
						} catch (err) {
							console.error("Error al importar handleLoginSubmit.js:", err);
						}
					}
	
					// Configurar evento para el botón de registro
					const signUp = this.container.querySelector("#signUp");
					if (signUp) {
						signUp.addEventListener("click", async () => {
							try {
								const { default: RegisterRender } = await import('./registerRender.js');
								const registerInstance = new RegisterRender('app-container');
								await registerInstance.render();
							} catch (err) {
								console.error("Error al importar registerRender.js:", err);
							}
						});
					}
				});
	
				return htmlContent;
			}
		} catch (error) {
			console.error("Error al renderizar la página de login:", error);
			return `<div id="pong-container">Ocurrió un error al generar el contenido</div>`;
		}
		return "";
	}
}

// import  {SPA} from './spa.js';

// const loginButton = document.getElementById("loginButton");
// const loginContainer = document.getElementById("app-container");
// const menuContainer = document.getElementById("menu-container");

// async function handleLoginSubmit(event: SubmitEvent) {
//     event.preventDefault();
//     const form = event.target as HTMLFormElement;
//     const formData = new FormData(form);
//     const data = Object.fromEntries(formData.entries());

//     try {
//         const response = await fetch("https://localhost:8443/back/auth/login", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify(data),
//         });
//         if (!response.ok)
// 		{
// 			const errorResponse = await response.json();
// 			alert(`Error message: , ${errorResponse.message}`);
// 			//throw new Error("Failed to send data");
// 		}
// 		else
// 		{
// 			const result = await response.json();
// 	        console.log("Data sent successfully:", result);
// 	        if (loginContainer)
// 	            loginContainer.innerHTML = "";

// 			const app = new SPA('content');
// 			app.navigate("#home");

// 		}	
//     }
//     catch (error) {
//         console.error(error);
//     }
// }

// async function render() {
//     try {
//         const response = await fetch("../html/login.html");
//         if (!response.ok)
//             throw new Error("Failed to load the HTML file");
//         const htmlContent = await response.text();
//         // history.pushState(null, '', '/login');
//         if (loginContainer) {
//             loginContainer.innerHTML = htmlContent;
//             const form = loginContainer.querySelector("form");
//             form?.addEventListener("submit", handleLoginSubmit);
//             const signUp = loginContainer.querySelector("#signUp");
//             signUp?.addEventListener("click", async () => {
//                 await import('./registerRender.js').then(module => module.render());
//             });
//             // document.getElementById("loginButton")?.classList.add("hidden");
//             // document.getElementById("registerButton")?.classList.remove("hidden");
//             // document.getElementById("headerSeparator")?.classList.add("hidden");
//         }
//     }
//     catch (error) {
//         console.error(error);
//     }
// }

// document.addEventListener("DOMContentLoaded", () => {
//     loginButton?.addEventListener("click", async () => {
//         await render();
//     });
// });

// export { render , handleLoginSubmit};