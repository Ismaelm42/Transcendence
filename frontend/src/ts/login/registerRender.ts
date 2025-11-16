import { Step } from '../spa/stepRender.js';
import { showMessage } from '../modal/showMessage.js';

export default class RegisterRender extends Step{
	async render(appElement: HTMLElement): Promise<void>  {

		const user = await this.checkAuth();
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
								handleRegisterSubmit(event);
							});
						} catch (err) {
						}
					}
				});
				appElement.innerHTML =  htmlContent;
			} catch (err) {
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
