import { Step } from './stepRender.js';

export default class Home extends Step {
	async render(): Promise<string> {
		const menuContainer = document.getElementById("menu-container");
		try {
			console.log("En render");
			const user = await this.checkAuth();
			console.log ('Hardcode user: ' + user);
		if (user) {
			// Retornar el contenido para usuarios autenticados
			return `
				<div id="pong-container">
					<div class="paddle left-paddle"></div>
					<h2>Bienvenido, ${user}!</h2>
					<div class="paddle right-paddle"></div>
				</div>
			`;
			} else {
				return `
					<div id="pong-container">
						<div class="paddle left-paddle"></div>
						<div class="ball"><img src="../img/bola.png" alt="Ball"></div>
						<div class="paddle right-paddle"></div>
					</div>
				`;
			}
		} 
		catch (error) {
			console.error("Error en render:", error);
			return `<div id="pong-container">Ocurrió un error al generar el contenido</div>`;
		}
	}
}
