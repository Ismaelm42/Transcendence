import  {SPA} from './spa.js';

export class Step {
	protected container: HTMLElement;
	protected spa: SPA;

	constructor(containerId: string) {
		this.container = document.getElementById(containerId) as HTMLElement;
		this.spa = SPA.getInstance(); // Obtenemos la instancia de SPA
	}

	async checkAuth() {

		const validation = false;
		// Simulación de verificación de autenticación PARA CUANDO LA COOKIE NO SE ENVIA BIEN"
		if (validation) {
			const user= {
				"username": "Pepe5@gmail.com",
				"password": "1234",
				"email": "Pepe5@gmail.com"
			}
			return user.username;
		}else {
			console.log("Verificando autenticación...");
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
		return '';
	}

	async renderMenu(): Promise<string> {
		return '';
	}

	navigate(step: string) {
		this.spa.navigate(step); // Usamos la instancia de SPA para navegar
	}
}
