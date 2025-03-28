export class SPA {
    private container: HTMLElement;
    private routes: { [key: string]: { module: string; protected: boolean } } = {
		'home': { module: 'home.js', protected: false },
        'login': { module: 'login.js', protected: false },
		'register': { module: 'register.js', protected: false },
		'play-pong': { module: 'playPong.js', protected: true },
		'play-tournament': { module: 'playTournament.js', protected: true },
		'friends': { module: 'friends.js', protected: true },
		'chat': { module: 'chat.js', protected: true },
		'stats': { module: 'stats.js', protected: true },
		'logout': { module: 'logout.js', protected: true }
    };
    
    constructor(containerId: string) {
        this.container = document.getElementById(containerId) as HTMLElement;
		
		// Cargar el footer - el el header se carga, laimagen en el index.html y los botones en "cada" módulo
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
			console.error('Error al cargar el header o footer:', error);
		}
	}

    navigate(step: string) {
        history.pushState({}, '', `${step}`);
        this.loadStep();
    }
    
	async loadStep() {
		let step = location.hash.replace('#', '') || 'home';
		const modulePath = this.routes[step];
		if (modulePath) {
			const module = await import(`./${modulePath.module}`);
			console.log('import:', module);

			const headerElement = document.getElementById('header_buttons');
			const menuElement = document.getElementById('menu-container');
			const appElement = document.getElementById('app-container');
			if (headerElement && module.renderHeader) {
				const headerContent = await module.renderHeader();
				if (headerContent) {
					headerElement.innerHTML = headerContent;
				}
			}
			if (menuElement && module.renderMenu) {
				const menuContent = await module.renderMenu();
				if (menuContent) {
					menuElement.innerHTML = menuContent;
				}
			}		
			if (appElement && module.render) {
				const appcontent = await module.render();
				if(appcontent) {
					appElement.innerHTML = appcontent;	
			}
		} else {
			const appElement = document.getElementById('app-container');
			if (appElement) {
				appElement.innerHTML = '<div>Step not found</div>';
			}
		}
	}

	}
	// updateUI() {
	// 	console.log ('En updateUI');
	// 	const isLoggedIn = this.isAuthenticated();
	// 	const loginButton = document.getElementById('loginButton');
	// 	const registerButton = document.getElementById('registerButton');
	// 	const logoutButton = document.getElementById('logoutButton');
	// 	const usernameSpan = document.getElementById('username');
	// 	const nav = document.getElementById('nav');

	// 	if (isLoggedIn) {
	// 		const username = this.getUsername();
	// 		loginButton?.classList.add('hidden');
	// 		registerButton?.classList.add('hidden');
	// 		logoutButton?.classList.remove('hidden');
	// 		usernameSpan?.classList.remove('hidden');
	// 		usernameSpan!.textContent = username;
	// 		nav?.classList.remove('hidden');
	// 	} else {
	// 		loginButton?.classList.remove('hidden');
	// 		registerButton?.classList.remove('hidden');
	// 		logoutButton?.classList.add('hidden');
	// 		usernameSpan?.classList.add('hidden');
	// 		nav?.classList.add('hidden');
	// 	}
	// }

	isAuthenticated(): boolean {
		// chequear si el usuario está autenticado
		return false;
	}

	// getUsername(): string {
	// 	// Aquí puedes agregar la lógica para obtener el nombre de usuario
	// 	// Por ejemplo, decodificar un token JWT o hacer una solicitud a la API
	// 	return localStorage.getItem('username') || 'User';
	// }
}

document.addEventListener('DOMContentLoaded', () => new SPA('content'));