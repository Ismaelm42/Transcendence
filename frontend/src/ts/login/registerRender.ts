import { Step } from '../spa/stepRender.js';
import { showMessage } from '../modal/showMessage.js';

export default class RegisterRender extends Step{
	async render(appElement: HTMLElement): Promise<void>  {

		const user = await this.checkAuth();
		console.log("En login render");
		if (user) {
			showMessage("Usuario autenticado, redirigiendo a perfil", 3000);
			window.location.hash = "#home";
		} else {
			try {
				const response = await fetch("../../html/login/register.html");
				if (!response.ok)
					throw new Error("Failed to load the HTML file");
				const htmlContent = await response.text();
				history.pushState(null, '', '/#register');

				requestAnimationFrame(async () => {
					const form = this.container.querySelector("form");
					if (form) {
						try {
							const { handleRegisterSubmit } = await import('./handleRegisterSubmit.js');
							form?.addEventListener("submit", async (event) => {
								event.preventDefault();
								// console.log("Se ha pulsado handleRegisterSubmit:", event);
								handleRegisterSubmit(event);
							});
						} catch (err) {
							console.error("Error al importar handleRegisterSubmit.js:", err);
						}
					}
				});
				appElement.innerHTML =  htmlContent;
			} catch (err) {
				console.error("Error in render method:", err);
				appElement.innerHTML =  `<div id="pong-container">Ocurrió un error al generar el contenido</div>`;
			}
		}
	}
	
	async renderHeader(headerElement: HTMLElement): Promise<void>  {
		headerElement.innerHTML = `
			<div id="authButtons" class="flex items-center">
				<a href="#login" class="text-white hover:text-gray-400">Login</a>
			</div>`;
	}
}
