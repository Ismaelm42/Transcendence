import { Step } from "./stepRender.js";
import { showMessage } from "./showMessage.js";

export class SPA {
    private container: HTMLElement;
    private static instance: SPA; // Guardamos una referencia estática y privada para solo poder acceder con el getter

    private routes: { [key: string]: { module: string; protected: boolean } } = {
        'home': { module: 'homeRender.js', protected: false },
        'login': { module: 'loginRender.js', protected: false },
        'register': { module: 'registerRender.js', protected: false },
        'play-pong': { module: 'playPongRender.js', protected: true },
        'play-tournament': { module: 'playTournamentRender.js', protected: true },
        'friends': { module: 'friendsRender.js', protected: true },
        'chat': { module: 'chatRender.js', protected: true },
        'stats': { module: 'statsRender.js', protected: true },
        'logout': { module: 'logoutRender.js', protected: true },
		'profile': { module: 'userProfileRender.js', protected: true }
    };

    public constructor(containerId: string) {
        this.container = document.getElementById(containerId) as HTMLElement;
		SPA.instance = this; // Guardamos la instancia en la propiedad estática para poder exportarla
        this.loadHEaderAndFooter();
		this.loadStep();
        window.onpopstate = () => this.loadStep();
		// this.navigate('home');
    }

    private async loadHEaderAndFooter() {

        try {
			// cargar el header

			const headerResponse = await fetch('../html/header.html');
			if (headerResponse.ok) {
				const headerContent = await headerResponse.text();
				const headerElement = document.getElementById('header-container');
				if (headerElement) {
					headerElement.innerHTML = headerContent;
				}
			} else {
				console.error('Error al cargar el header:', headerResponse.statusText);
			}
			// Cargar el footer
            const footerResponse = await fetch('../html/footer.html');
            if (footerResponse.ok) {
                const footerContent = await footerResponse.text();
                const footerElement = document.getElementById('footer-container');
                if (footerElement) {
                    footerElement.innerHTML = footerContent;
                }
            } else {
                console.error('Error al cargar el footer:', footerResponse.statusText);
            }
        } catch (error) {
            console.error('Error al cargar el footer:', error);
        }
    }

    navigate(step: string) {
        history.pushState({}, '', `#${step}`);
        this.loadStep();
    }

	async loadStep() {
		let step = location.hash.replace('#', '') || 'home';
		// this.navigate(step);

		// // Obtener la URL actual
		// let currentUrl = window.location.href;

		// // Eliminar todo lo que está después de la última barra
		// let baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/') + 1);

		// // Modificar la URL para que termine con /#home
		// let newUrl = baseUrl + '#home';

		// // Actualizar la URL sin recargar la página
		// history.replaceState(null, '', newUrl);

		const routeConfig = this.routes[step];
		console.log (this);
		if (routeConfig) {
			//Verificar si la ruta es protegida y si el usuario está autenticado

			// Cargar el módulo correspondiente
			console.log("he pasado por loadStep de la clase SPA");
			//importamos el módulo correspondiente
			const module = await import(`./${routeConfig.module}`);
			// Creamos una instancia del módulo
			const stepInstance = new module.default('app-container');
			// Verificamos si el usuario está autenticado
			const user = await stepInstance.checkAuth();
			if (user) {
				console.log("Usuario autenticado: ", user);
			} else {
				console.log("Usuario no autenticado: ", user);
			}
			if (routeConfig.protected && !user) {
				console.warn(`Acceso denegado a la ruta protegida: ${step}`);
				this.navigate('login'); // Redirigir al usuario a la página de login
				return;
			}
			await stepInstance.init(); // Inicializar el módulo
		} else {
			showMessage('url does not exist', 2000);
			window.location.hash = '#home'; 
		}
	}

    // isAuthenticated(): boolean {
	// 	//hardcode para las pruebas
    //     // return false; // Aquí iría la lógica real de autenticación
	// 	return true; // Para pruebas, siempre autenticado
    // }

    // // Método estático para acceder a la instancia de SPA
    // static getInstance(): SPA {
    //     return SPA.instance;
    // }

	public static getInstance(): SPA {
		return SPA.instance;
	}


}

document.addEventListener('DOMContentLoaded', () => new SPA('content'));