"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class SPA {
    constructor(containerId) {
        this.routes = {
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
        this.container = document.getElementById(containerId);
        window.onpopstate = () => this.loadStep();
        this.updateUI();
        if (!this.isAuthenticated()) {
            this.navigate('home');
        }
        else {
            this.loadStep();
        }
    }
    navigate(step) {
        history.pushState({}, '', `#${step}`);
        this.loadStep();
    }
    loadStep() {
        return __awaiter(this, void 0, void 0, function* () {
            const step = location.hash.replace('#', '') || 'home';
            const modulePath = this.routes[step];
            if (modulePath) {
                const module = yield import(`./${modulePath}`);
                this.container.innerHTML = module.render();
            }
            else {
                this.container.innerHTML = '<div>Step not found</div>';
            }
        });
    }
    updateUI() {
        console.log('En updateUI');
        const isLoggedIn = this.isAuthenticated();
        const loginButton = document.getElementById('loginButton');
        const registerButton = document.getElementById('registerButton');
        const logoutButton = document.getElementById('logoutButton');
        const usernameSpan = document.getElementById('username');
        const nav = document.getElementById('nav');
        if (isLoggedIn) {
            const username = this.getUsername();
            loginButton === null || loginButton === void 0 ? void 0 : loginButton.classList.add('hidden');
            registerButton === null || registerButton === void 0 ? void 0 : registerButton.classList.add('hidden');
            logoutButton === null || logoutButton === void 0 ? void 0 : logoutButton.classList.remove('hidden');
            usernameSpan === null || usernameSpan === void 0 ? void 0 : usernameSpan.classList.remove('hidden');
            usernameSpan.textContent = username;
            nav === null || nav === void 0 ? void 0 : nav.classList.remove('hidden');
        }
        else {
            loginButton === null || loginButton === void 0 ? void 0 : loginButton.classList.remove('hidden');
            registerButton === null || registerButton === void 0 ? void 0 : registerButton.classList.remove('hidden');
            logoutButton === null || logoutButton === void 0 ? void 0 : logoutButton.classList.add('hidden');
            usernameSpan === null || usernameSpan === void 0 ? void 0 : usernameSpan.classList.add('hidden');
            nav === null || nav === void 0 ? void 0 : nav.classList.add('hidden');
        }
    }
    isAuthenticated() {
        // Aquí puedes agregar la lógica para verificar si el usuario está autenticado
        // Por ejemplo, verificar un token en el localStorage o una cookie
        return !!localStorage.getItem('authToken');
    }
    getUsername() {
        // Aquí puedes agregar la lógica para obtener el nombre de usuario
        // Por ejemplo, decodificar un token JWT o hacer una solicitud a la API
        return localStorage.getItem('username') || 'User';
    }
}
document.addEventListener('DOMContentLoaded', () => new SPA('app-container'));
