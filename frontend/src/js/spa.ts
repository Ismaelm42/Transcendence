class SPA {
    private container: HTMLElement;
    private routes: { [key: string]: string } = {
        'home': 'home.js',
        'login': 'login.js',
        'register': 'register.js',
        'play-pong': 'playPong.js',
        'play-tournament': 'playTournament.js',
        'friends': 'friends.js',
        'chat': 'chat.js',
        'stats': 'stats.js',
		'logout': 'logout.js'
    };
    
    constructor(containerId: string) {
        this.container = document.getElementById(containerId) as HTMLElement;
        window.onpopstate = () => this.loadStep();
        this.updateUI();
        if (!this.isAuthenticated()) {
            this.navigate('home');
        } else {
            this.loadStep();
        }
    }
    
    navigate(step: string) {
        history.pushState({}, '', `#${step}`);
        this.loadStep();
    }
    
    async loadStep() {
        const step = location.hash.replace('#', '') || 'home';
        const modulePath = this.routes[step];
        if (modulePath) {
            const module = await import(`./${modulePath}`);
            this.container.innerHTML = module.render();
        } else {
            this.container.innerHTML = '<div>Step not found</div>';
		}
	}

	updateUI() {
		console.log ('En updateUI');
		const isLoggedIn = this.isAuthenticated();
		const loginButton = document.getElementById('loginButton');
		const registerButton = document.getElementById('registerButton');
		const logoutButton = document.getElementById('logoutButton');
		const usernameSpan = document.getElementById('username');
		const nav = document.getElementById('nav');

		if (isLoggedIn) {
			const username = this.getUsername();
			loginButton?.classList.add('hidden');
			registerButton?.classList.add('hidden');
			logoutButton?.classList.remove('hidden');
			usernameSpan?.classList.remove('hidden');
			usernameSpan!.textContent = username;
			nav?.classList.remove('hidden');
		} else {
			loginButton?.classList.remove('hidden');
			registerButton?.classList.remove('hidden');
			logoutButton?.classList.add('hidden');
			usernameSpan?.classList.add('hidden');
			nav?.classList.add('hidden');
		}
	}

	isAuthenticated(): boolean {
		// Aquí puedes agregar la lógica para verificar si el usuario está autenticado
		// Por ejemplo, verificar un token en el localStorage o una cookie
		return !!localStorage.getItem('authToken');
	}

	getUsername(): string {
		// Aquí puedes agregar la lógica para obtener el nombre de usuario
		// Por ejemplo, decodificar un token JWT o hacer una solicitud a la API
		return localStorage.getItem('username') || 'User';
	}
}

document.addEventListener('DOMContentLoaded', () => new SPA('app-container'));