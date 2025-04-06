import { Step } from './stepRender.js';

export default class Tournament extends Step {
	
	async render(): Promise<string> {
		const menuContainer = document.getElementById("menu-container");
		try {
			console.log("En Play Tournament Step render");
	
			const user = await this.checkAuth();

			if (user) {		
				// Retornar el contenido para usuarios autenticados
				return`
						<div class="flex-grow flex flex-col items-center justify-center ">
		   					<h1 class="text-4xl font-bold text-gray-800">Play Tournament Step</h1>
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

	// async renderHeader(): Promise<string> {
	// 	console.log('En Friends Step');
	// 	try {
	// 		const user = await this.checkAuth();
	
	// 		return user ? `
	// 			<div id="authButtons" class="flex items-center">
	// 				<span id="username" class="text-white">${user}</span>
	// 				<div id="headerSeparator" class="vertical-bar"></div>
	// 				<a href="#logout" id="logoutButton" class="text-white hover:text-gray-400">Logout</a>
	// 			</div>
	// 		` : `
	// 			<div id="authButtons" class="flex items-center">
	// 				<a href="#login" class="text-white hover:text-gray-400">Login</a>
	// 				<div id="headerSeparator" class="vertical-bar"></div>
	// 				<a href="#register" class="text-white hover:text-gray-400 ml-2">Register</a>
	// 			</div>
	// 		`;
	// 	} catch (error) {
	// 		console.error("Error en renderHeader:", error);
	// 		return `<div id="authButtons">Error al cargar el estado de autenticación</div>`;
	// 	}
	// }

	// async renderMenu(): Promise<string> {
	// 	return `<ul><li>Inicio</li><li>Contacto</li></ul>`;
	// }

// 	// Método para inicializar eventos después de renderizar el contenido
// 	async afterRender() {
// 		document.getElementById('goToLogin')?.addEventListener('click', () => {
// 			this.navigate('login');
// 		});
// 	}
}
