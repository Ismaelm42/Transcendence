import { Step } from './stepRender.js';

export default class Stats extends Step {
	
	async render(): Promise<string> {
		const menuContainer = document.getElementById("menu-container");
		try {
			console.log("En Stats Step render");
	
			const user = await this.checkAuth();

			if (user) {
				// Retornar el contenido para usuarios autenticados
				return`
						<div class="flex-grow flex flex-col items-center justify-center ">
		   					<h1 class="text-4xl font-bold text-gray-800">Stats Step</h1>
						</div>
				`;
				} else {	
					// Retornar el contenido para usuarios no autenticados
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
