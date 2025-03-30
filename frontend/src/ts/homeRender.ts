import { Step } from './stepRender.js';

export default class Home extends Step {
	async render(): Promise<string> {
		const menuContainer = document.getElementById("menu-container");
		try {
			console.log("En render");
	
			const user = await this.checkAuth();
			console.log ('Hardcode user: ' + user);
		if (user) {
			// Modificar el innerHTML de menuContainer si el usuario está autenticado
			if (menuContainer) {
				menuContainer.innerHTML = `
					<nav id="nav" class="bg-gray-800 p-4">
						<ul class="flex space-x-4">
							<li><a href="#play-pong" class="text-white hover:text-gray-400">Play Game</a></li>
							<li><a href="#play-tournament" class="text-white hover:text-gray-400">Start Tournament</a></li>
							<li><a href="#friends" class="text-white hover:text-gray-400">Friends</a></li>
							<li><a href="#chat" class="text-white hover:text-gray-400">Chat</a></li>
							<li><a href="#stats" class="text-white hover:text-gray-400">Stats</a></li>
						</ul>
					</nav>
				`;
			}
	
			// Retornar el contenido para usuarios autenticados
			return `
				<div id="pong-container">
					<div class="paddle left-paddle"></div>
					<h2>Bienvenido, ${user}!</h2>
					<div class="paddle right-paddle"></div>
				</div>
			`;
			} else {
				if (menuContainer) {
					menuContainer.innerHTML = "";
				}			
	
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

	async renderHeader(): Promise<string> {
		console.log('En renderHeader');
		try {
			const user = await this.checkAuth();
	
			return user ? `
				<div id="authButtons" class="flex items-center">
					<span id="username" class="text-white">${user}</span>
					<div id="headerSeparator" class="vertical-bar"></div>
					<a href="#logout" id="logoutButton" class="text-white hover:text-gray-400">Logout</a>
				</div>
			` : `
				<div id="authButtons" class="flex items-center">
					<a href="#login" class="text-white hover:text-gray-400">Login</a>
					<div id="headerSeparator" class="vertical-bar"></div>
					<a href="#register" class="text-white hover:text-gray-400 ml-2">Register</a>
				</div>
			`;
		} catch (error) {
			console.error("Error en renderHeader:", error);
			return `<div id="authButtons">Error al cargar el estado de autenticación</div>`;
		}
	}

	async renderMenu(): Promise<string> {
		return `<ul><li>Inicio</li><li>Contacto</li></ul>`;
	}

	// Método para inicializar eventos después de renderizar el contenido
	async afterRender() {
		document.getElementById('goToLogin')?.addEventListener('click', () => {
			this.navigate('login');
		});
	}
}
