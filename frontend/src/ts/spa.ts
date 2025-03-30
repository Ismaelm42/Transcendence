export class SPA {
    private container: HTMLElement;
    private static instance: SPA; // Guardamos una referencia estática

    private routes: { [key: string]: { module: string; protected: boolean } } = {
        'home': { module: 'homeRender.js', protected: false },
        'login': { module: 'loginRender.js', protected: false },
        'register': { module: 'registerRender.js', protected: false },
        'play-pong': { module: 'playPongRender.js', protected: true },
        'play-tournament': { module: 'playTournamentRender.js', protected: true },
        'friends': { module: 'friendsRender.js', protected: true },
        'chat': { module: 'chatRender.js', protected: true },
        'stats': { module: 'statsRender.js', protected: true },
        'logout': { module: 'logoutRender.js', protected: true }
    };

    constructor(containerId: string) {
        this.container = document.getElementById(containerId) as HTMLElement;
        SPA.instance = this; // Guardamos la instancia en una propiedad estática

        this.loadFooter();
        window.onpopstate = () => this.loadStep();
        if (!this.isAuthenticated()) {
            this.navigate('home');
        } else {
            this.loadStep();
        }
    }

    private async loadFooter() {

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
		const routeConfig = this.routes[step];
	
		if (routeConfig) {
			// Verificar si la ruta es protegida y si el usuario está autenticado
			if (routeConfig.protected && !this.isAuthenticated()) {
				console.warn(`Acceso denegado a la ruta protegida: ${step}`);
				this.navigate('login'); // Redirigir al usuario a la página de login
				return;
			}
	
			// Cargar el módulo correspondiente
			const module = await import(`./${routeConfig.module}`);
			const stepInstance = new module.default('app-container');
	
			const headerElement = document.getElementById('header_buttons');
			const menuElement = document.getElementById('menu-container');
			const appElement = document.getElementById('app-container');
	
			if (headerElement) {
				headerElement.innerHTML = await stepInstance.renderHeader();
			}
			if (menuElement) {
				menuElement.innerHTML = await stepInstance.renderMenu();
			}
			if (appElement) {
				appElement.innerHTML = await stepInstance.render();
			}
		} else {
			this.container.innerHTML = '<div>Step not found</div>';
		}
	}

    isAuthenticated(): boolean {
		//hardcode para las pruebas
        // return false; // Aquí iría la lógica real de autenticación
		return true; // Para pruebas, siempre autenticado
    }

    // Método estático para acceder a la instancia de SPA
    static getInstance(): SPA {
        return SPA.instance;
    }
}

document.addEventListener('DOMContentLoaded', () => new SPA('content'));