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
            'login': 'login.js',
            'register': 'register.js',
            'play-pong': 'playPong.js',
            'play-tournament': 'playTournament.js',
            'friends': 'friends.js',
            'chat': 'chat.js',
            'stats': 'stats.js'
        };
        this.container = document.getElementById(containerId);
        window.onpopstate = () => this.loadStep();
        this.loadStep();
    }
    navigate(step) {
        history.pushState({}, '', `#${step}`);
        this.loadStep();
    }
    loadStep() {
        return __awaiter(this, void 0, void 0, function* () {
            const step = location.hash.replace('#', '') || 'login';
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
}
document.addEventListener('DOMContentLoaded', () => new SPA('app-container'));
