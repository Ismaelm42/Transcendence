import { Step } from '../spa/stepRender.js';

export default class Home extends Step {
	async render(appElement: HTMLElement): Promise<void> {
		const menuContainer = document.getElementById("menu-container");
		try {
			const user = await this.checkAuth();
			console.log ('En Home user despues de checkAuth: ' + user);
		if (user) {
			// Retornar el contenido para usuarios autenticados
			appElement.innerHTML =  `
				<div id="pong-container">
					<div class="paddle left-paddle"></div>
					<h2>Bienvenido, ${user}!</h2>
					<div class="paddle right-paddle"></div>
				</div>
			`;
			} else {
				appElement.innerHTML =  `
					<div id="pong-container">
						<div class="paddle left-paddle"></div>
						<div class="ball"><img src="../img/bola.png" alt="Ball"></div>
						<div class="paddle right-paddle"></div>
					</div>
				`;
			}
		} 
		catch (error) {
			appElement.innerHTML =  `<div id="pong-container">Ocurrió un error al generar el contenido</div>`;
		}
	}
}
