var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class SPA {
    constructor(containerId) {
        this.routes = {
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
        this.container = document.getElementById(containerId);
        // Cargar el footer - el el header se carga, laimagen en el index.html y los botones en "cada" módulo
        this.loadFooter();
        window.onpopstate = () => this.loadStep();
        if (!this.isAuthenticated()) {
            this.navigate('home');
        }
        else {
            this.loadStep();
        }
    }
	
    loadFooter() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Cargar el footer
                const footerResponse = yield fetch('../html/footer.html');
                if (footerResponse.ok) {
                    const footerContent = yield footerResponse.text();
                    const footerElement = document.getElementById('footer-container');
                    if (footerElement) {
                        footerElement.innerHTML = footerContent;
                    }
                }
                else {
                    console.error('Error al cargar el footer:', footerResponse.statusText);
                }
            }
            catch (error) {
                console.error('Error al cargar el header o footer:', error);
            }
        });
    }
    navigate(step) {
        history.pushState({}, '', `${step}`);
        this.loadStep();
    }
    loadStep() {
        return __awaiter(this, void 0, void 0, function* () {
            let step = location.hash.replace('#', '') || 'home';
            const modulePath = this.routes[step];
            if (modulePath) {
                const module = yield import(`./${modulePath.module}`);
                console.log('import:', module);
                const headerElement = document.getElementById('header_buttons');
                const menuElement = document.getElementById('menu-container');
                const appElement = document.getElementById('app-container');
                if (headerElement && module.renderHeader) {
                    const headerContent = yield module.renderHeader();
                    if (headerContent) {
                        headerElement.innerHTML = headerContent;
                    }
                }
                if (menuElement && module.renderMenu) {
                    const menuContent = yield module.renderMenu();
                    if (menuContent) {
                        menuElement.innerHTML = menuContent;
                    }
                }
                if (appElement && module.render) {
                    const appcontent = yield module.render();
                    if (appcontent) {
                        appElement.innerHTML = appcontent;
                    }
                }
                else {
                    const appElement = document.getElementById('app-container');
                    if (appElement) {
                        appElement.innerHTML = '<div>Step not found</div>';
                    }
                }
            }
        });
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
    isAuthenticated() {
        // console.log('En isAuthenticated');
        // console.log(localStorage.getItem('authToken'));
        // Aquí puedes agregar la lógica para verificar si el usuario está autenticado
        // Por ejemplo, verificar un token en el localStorage o una cookie
        // return !!localStorage.getItem('username');
        // !!localStorage.getItem('authToken')
        return false;
    }
}
document.addEventListener('DOMContentLoaded', () => new SPA('content'));
