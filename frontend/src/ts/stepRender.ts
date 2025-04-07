import  {SPA} from './spa.js';

export class Step {
	protected container: HTMLElement;
	protected spa: SPA;
	protected username: string | null = null; // Almacena el nombre de usuario autenticado

	constructor(containerId: string) {
		this.container = document.getElementById(containerId) as HTMLElement;
		this.spa = SPA.getInstance(); // Obtenemos la instancia de SPA
		this.initializeUsername();

	}

	private async initializeUsername() {
		this.username = await this.checkAuth();
	}

	async checkAuth() {
		console.log("Verificando autenticación en checkAuth()...");
		const validation = false;	// si está en false se está verificando la autenticación
		// Simulación de verificación de autenticación PARA CUANDO LA COOKIE NO SE ENVIA BIEN"
		if (validation) {
			const user= {
				"username": "Pepe5@gmail.com",
				"password": "1234",
				"email": "Pepe5@gmail.com"
			}
			return user.username;
		}else {
			// console.log("Verificando autenticación...");
			try {	
				const response = await fetch("https://localhost:8443/back/auth/verify-token", {
					method: "GET",
					credentials: "include"
				});
		
				if (!response.ok) return null;
					const data = await response.json();
				return data.user.username; // Devuelve el nombre de usuario si está autenticado
				} catch (error) {
					console.error("Error al verificar la autenticación:", error);
					return null;
				}
		}
	}
	
	async render(): Promise<string> {
		return '<div>Contenido no definido</div>';
	}

	async renderHeader(): Promise<string> {
		try {
			const user = await this.checkAuth();
			// console.log("Valor de user en renderHeader:", user);
			return user ? 			
				`<div id="authButtons" class="flex items-center">
					<span id="username" class="text-white"><a href="#profile"> ${user} </a></span>
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
		const user = await this.checkAuth();
		if (user) {
			// Modificar el innerHTML de menuContainer si el usuario está autenticado
			return `
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
		}else {
			return '';
		}
	}

	navigate(step: string) {
		this.spa.navigate(step); // Usamos la instancia de SPA para navegar
	}
}
