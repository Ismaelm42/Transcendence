import { Step } from '../spa/stepRender.js';

export default class Tournament extends Step {
	
	async render(appElement: HTMLElement): Promise<void>  {
		const menuContainer = document.getElementById("menu-container");
		try {
			console.log("En Play Tournament Step render");
			const user = await this.checkAuth();
			if (user) {		
				// Retornar el contenido para usuarios autenticados
				appElement.innerHTML = `
						<div class="flex-grow flex flex-col items-center justify-center ">
		   					<h1 class="text-4xl font-bold text-gray-800">Play Tournament Step</h1>
						</div>
				`;
				} else {
					// Retornar el contenido para usuarios no autenticados
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
			console.error("Error en render:", error);
			appElement.innerHTML =  `<div id="pong-container">Ocurrió un error al generar el contenido</div>`;
		}
	}
}
