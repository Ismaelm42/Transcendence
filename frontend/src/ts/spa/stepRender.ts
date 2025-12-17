import { SPA } from './spa.js';

export class Step {
	protected container: HTMLElement;
	protected spa: SPA;
	protected username: string | null = null; // Almacena el nombre de usuario autenticado
	public static chatSocket: WebSocket | null = null; // Almacena la conexión WebSocket
	public static chessSocket: WebSocket | null = null;

	constructor(containerId: string) {
		this.container = document.getElementById(containerId) as HTMLElement;
		this.spa = SPA.getInstance(); // Obtenemos la instancia de SPA
		this.initializeUsername();
	}

	private async initializeUsername() {
		this.username = await this.checkAuth();
	}

	async checkAuth() {
		const validation = false;	// si está en false se está verificando la autenticación
		// Simulación de verificación de autenticación PARA CUANDO LA COOKIE NO SE ENVIA BIEN"
		if (validation) {
			const user = {
				"username": "Pepe5@gmail.com",
				"password": "1234",
				"email": "Pepe5@gmail.com"
			}
			return user.username;
		}else {
			try {	
				const response = await fetch(`https://${window.location.host}/back/auth/verify-token`, {
					method: "GET",
					credentials: "include"
				});

				if (!response.ok) return null;
				const data = await response.json();
				return data.user.username; // Devuelve el nombre de usuario si está autenticado
				} catch (error) {
					return null;
				}
		}
	}

	async render(appElement: HTMLElement): Promise<void> {
		appElement.innerHTML = '<div>Contenido no definido</div>';
	}

	async renderHeader(headerElement: HTMLElement): Promise<void> {
		try {
			const user = await this.checkAuth();
			headerElement.innerHTML = user ? 			
				`<div id="authButtons" class="flex items-center">
					<span id="username" class="text-white hover:text-amber-300"><a href="#profile"> ${user} </a></span>
					<div id="headerSeparator" class="vertical-bar border-l border-white h-6 ml-3.5 mr-2.5"></div>
					<a href="#logout" id="logoutButton" class="text-white hover:text-amber-300">Logout</a>
				</div>
			` : `
				<div id="authButtons" class="flex items-center">
					<a href="#login" class="text-white hover:text-amber-300">Login</a>
					<div id="headerSeparator" class="vertical-bar border-l border-white h-6 ml-3.5 mr-2.5"></div>
					<a href="#register" class="text-white hover:text-amber-300 ml-2">Register</a>
				</div>
			`;
		} catch (error) {
			headerElement.innerHTML = `<div id="authButtons">Error al cargar el estado de autenticación</div>`;
		}
	}

	/**º
	 * Método para renderizar el menú de navegación si se está logueado
	 * @param menuElement elemento HTML donde se renderiza el menú
	 */
	async renderMenu(menuElement: HTMLElement): Promise<void> {
		const user = await this.checkAuth();
		if (user) {
			menuElement.innerHTML = `
			<nav id="nav" class="bg-pong-secondary p-4 border-b-2 border-amber-300">
			  <ul class="
			    flex
			    flex-wrap
			    justify-center
			    gap-4

			    md:flex-nowrap
			    md:justify-center

			    lg:justify-start
			  ">
			    <li class="basis-1/3 md:basis-auto text-center transition-colors">
			      <a href="#game-lobby" class="block px-3 py-2 hover:text-amber-300 hover:font-bold">
			        Play Game
			      </a>
			    </li>

			    <li class="basis-1/3 md:basis-auto text-center transition-colors">
			      <a href="#play-chess" class="block px-3 py-2 hover:text-amber-300 hover:font-bold">
			        Chess
			      </a>
			    </li>

			    <li class="basis-1/3 md:basis-auto text-center transition-colors">
			      <a href="#tournament-lobby" class="block px-3 py-2 hover:text-amber-300 hover:font-bold">
			        Tournaments
			      </a>
			    </li>

			    <li class="basis-1/3 md:basis-auto text-center transition-colors">
			      <a href="#friends" class="block px-3 py-2 hover:text-amber-300 hover:font-bold">
			        Friends
			      </a>
			    </li>

			    <li class="basis-1/3 md:basis-auto text-center transition-colors">
			      <a href="#chat" class="block px-3 py-2 hover:text-amber-300 hover:font-bold">
			        Chat
			      </a>
			    </li>

			    <li class="basis-1/3 md:basis-auto text-center transition-colors">
			      <a href="#stats" class="block px-3 py-2 hover:text-amber-300 hover:font-bold">
			        Stats
			      </a>
			    </li>
			  </ul>
			</nav>

			`;
		} else {
			menuElement.innerHTML = '';
		}
	}

	/**
	 * Método para navegar a un paso especifico
	 * @param step nombre del paso al que se quiere navegar
	 */
	navigate(step: string) {
		this.spa.navigate(step); // Usamos la instancia de SPA para navegar
	}

	/**
	 * 
	 * @param headerElement botónes del header
	 * @param menuElement barra de navegación
	 * @param appElement contenido o cuerpo principal de la aplicación
	 * 
	 */
	async initChild(headerElement: HTMLElement, menuElement: HTMLElement, appElement: HTMLElement) {
		if (headerElement) {
			await this.renderHeader(headerElement);
		}
		if (menuElement) {
			await this.renderMenu(menuElement);
		}
		if (appElement) {
			await this.render(appElement);
		}
	}

	/**
	 * Método para inicializar el paso se asegura que existen los elementos header, menu y app
	 * para poder renderizar el contenido correspondiente en cada slot o "placeholder"
	 */
	async init() {
		let headerElement = document.getElementById('header-buttons');
		let menuElement = document.getElementById('menu-container');
		let appElement = document.getElementById('app-container');

		while (!headerElement || !menuElement || !appElement) {
			await new Promise(resolve => setTimeout(resolve, 100)); // Esperar 100ms antes de volver a comprobar
			headerElement = document.getElementById('header-buttons');
			menuElement = document.getElementById('menu-container');
			appElement = document.getElementById('app-container');
		}
		this.initChild(headerElement, menuElement, appElement);

	}
}
