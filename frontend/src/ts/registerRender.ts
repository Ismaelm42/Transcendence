import { Step } from './stepRender.js';

export default class RegisterRender extends Step{
	async render(): Promise<string> {
		try {
			const response = await fetch("../html/register.html");
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
			return htmlContent;
		} catch (err) {
			console.error("Error in render method:", err);
			return `<div id="pong-container">Ocurrió un error al generar el contenido</div>`;
		}
	}
	
	async renderHeader(): Promise<string> {
		return `
			<div id="authButtons" class="flex items-center">
				<a href="#login" class="text-white hover:text-gray-400">Login</a>
			</div>`;
	}
}
