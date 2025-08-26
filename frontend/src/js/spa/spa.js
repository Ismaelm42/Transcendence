var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { showMessage } from "../modal/showMessage.js";
import { initOnlineSocket, onlineSocket } from "../friends/onlineUsersSocket.js";
import { clearSearchFilter } from "../chat/filterSearch.js";
export class SPA {
    constructor(containerId) {
        this.currentGame = null;
        this.currentTournament = null;
        this.currentStep = null;
        this.routes = {
            'home': { module: '../home/homeRender.js', protected: false },
            'login': { module: '../login/loginRender.js', protected: false },
            'register': { module: '../login/registerRender.js', protected: false },
            'game-lobby': { module: '../game/Game.js', protected: true },
            'game-match': { module: '../game/GameMatch.js', protected: true },
            'tournament-lobby': { module: '../tournament/Tournament.js', protected: true },
            'friends': { module: '../friends/friendsRender.js', protected: true },
            'chat': { module: '../chat/chatRender.js', protected: true },
            'stats': { module: '../stats/statsRender.js', protected: true },
            'logout': { module: '../login/logoutRender.js', protected: true },
            'profile': { module: '../profile/userProfileRender.js', protected: true },
            'test': { module: '../game/tournamentGameTest.js', protected: true }
        };
        this.container = document.getElementById(containerId);
        SPA.instance = this;
        this.loadHEaderAndFooter();
        this.loadStep();
        // Changes to advise the user when they leave a tournament in progress
        //it will reset the tournament guards and delete TempUsers
        window.onpopstate = () => {
            var _a, _b;
            if (this.currentTournament && typeof this.currentTournament.getTournamentId === 'function') {
                const tournamentId = this.currentTournament.getTournamentId();
                const warningFlag = this.currentTournament.LeaveWithoutWarningFLAG;
                // If the tournament is in progress, show a warning message is it is not already shown
                if (typeof tournamentId !== 'undefined' && tournamentId !== null && tournamentId > -42
                    && warningFlag !== true) {
                    showMessage("Tournament in progress aborted?", 5000);
                    const tournamentUI = (_b = (_a = this.currentTournament).getTournamentUI) === null || _b === void 0 ? void 0 : _b.call(_a);
                    if (tournamentUI && typeof tournamentUI.resetTournament === 'function') {
                        tournamentUI.resetTournament();
                    }
                    // loop to wait for the message to be closed
                    const messageContainer = document.getElementById("message-container");
                    const intervalId = setInterval(() => {
                        if ((messageContainer === null || messageContainer === void 0 ? void 0 : messageContainer.style.display) === 'none') {
                            clearInterval(intervalId);
                        }
                    }, 1000);
                }
                const step = location.hash.replace('#', '') || 'home';
                this.loadStep();
            }
            else {
                const step = location.hash.replace('#', '') || 'home';
                this.loadStep();
            }
        };
        window.addEventListener("pageshow", (event) => {
            if (event.persisted && location.hash === '#login') {
                console.log("Recargando el step de login");
                const appContainer = document.getElementById('app-container');
                if (appContainer) {
                    appContainer.innerHTML = '';
                }
                this.loadStep();
            }
        });
    }
    loadHEaderAndFooter() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // cargar el header
                const headerResponse = yield fetch('../../html/layout/header.html');
                if (headerResponse.ok) {
                    const headerContent = yield headerResponse.text();
                    const headerElement = document.getElementById('header-container');
                    if (headerElement) {
                        headerElement.innerHTML = headerContent;
                    }
                }
                else {
                    console.error('Error al cargar el header:', headerResponse.statusText);
                }
                // Cargar el footer
                const footerResponse = yield fetch('../../html/layout/footer.html');
                if (footerResponse.ok) {
                    const footerContent = yield footerResponse.text();
                    const footerElement = document.getElementById('footer-container');
                    if (footerElement) {
                        footerElement.innerHTML = footerContent;
                    }
                    console.log('footer cargado');
                }
                else {
                    console.error('Error al cargar el footer:', footerResponse.statusText);
                }
            }
            catch (error) {
                console.error('Error al cargar el footer:', error);
            }
        });
    }
    navigate(step) {
        history.pushState({}, '', `#${step}`);
        this.loadStep();
    }
    loadStep() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
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
            // Handle leaving game-match step on active game
            if (this.currentStep === 'game-match' && step !== 'game-match' &&
                this.currentGame && this.currentGame.getGameConnection() &&
                this.currentGame.getGameConnection().socket &&
                this.currentGame.isGameActive()) {
                const log = this.currentGame.getGameLog();
                const username = this.currentGame.getGameIsHost()
                    ? (_a = log.playerDetails.player1) === null || _a === void 0 ? void 0 : _a.username
                    : (_b = log.playerDetails.player2) === null || _b === void 0 ? void 0 : _b.username;
                (_d = (_c = this.currentGame.getGameConnection()) === null || _c === void 0 ? void 0 : _c.socket) === null || _d === void 0 ? void 0 : _d.send(JSON.stringify({
                    type: 'PAUSE_GAME',
                    reason: `${username} left the game`
                }));
            }
            this.currentStep = step;
            const routeConfig = this.routes[step];
            if (routeConfig) {
                const module = yield import(`./${routeConfig.module}`);
                let stepInstance;
                if (step === 'game-match') {
                    stepInstance = new module.default(this.currentGame, this.currentTournament);
                    if (this.currentGame && stepInstance)
                        this.currentGame.setGameMatch(stepInstance);
                }
                else if (step === 'game-lobby') {
                    stepInstance = new module.default('app-container');
                    this.currentGame = stepInstance;
                }
                else if (step === 'tournament-lobby') {
                    stepInstance = new module.default('app-container');
                    this.currentTournament = stepInstance;
                    console.log('tournament-lobby currentTournament: ', this.currentTournament);
                }
                else
                    stepInstance = new module.default('app-container');
                const user = yield stepInstance.checkAuth();
                if (user) {
                    console.log("Usuario autenticado: ", user);
                    // Si el usuario está autenticado, inicializamos el socket de usuarios online
                    if (!onlineSocket || onlineSocket.readyState === WebSocket.CLOSED) {
                        initOnlineSocket();
                    }
                }
                else {
                    console.log("Usuario no autenticado: ", user);
                }
                if (routeConfig.protected && !user) {
                    console.warn(`Acceso denegado a la ruta protegida: ${step}`);
                    this.navigate('login');
                    return;
                }
                //await stepInstance.init();
                if (step === 'chat') {
                    try {
                        clearSearchFilter();
                    }
                    catch (e) { /* ignore */ }
                }
                yield stepInstance.init();
            }
            else {
                showMessage('url does not exist', 2000);
                window.location.hash = '#home';
            }
        });
    }
    static getInstance() {
        return SPA.instance;
    }
}
document.addEventListener('DOMContentLoaded', () => new SPA('content'));
