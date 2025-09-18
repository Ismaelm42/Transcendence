var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { showMessage, showConfirmDialog } from "../modal/showMessage.js";
import { initOnlineSocket, onlineSocket } from "../friends/onlineUsersSocket.js";
export class SPA {
    constructor(containerId) {
        this.currentGame = null;
        this.currentTournament = null;
        this.currentStep = null;
        // Guard flag to avoid double prompts (popstate + hashchange firing together)
        this.navigationGuardActive = false;
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
            'profile': { module: '../profile/userProfileRender.js', protected: true }
        };
        this.container = document.getElementById(containerId);
        SPA.instance = this;
        this.loadHEaderAndFooter();
        this.loadStep();
        // Changes to advise the user when they leave a tournament in progress
        //it will reset the tournament guards and delete TempUsers
        window.onpopstate = () => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const nextStep = location.hash.replace('#', '') || 'home';
            // Intercept leaving game-match BEFORE existing tournament logic
            if (!this.navigationGuardActive && this.currentStep === 'game-match' && nextStep !== 'game-match') {
                this.navigationGuardActive = true;
                const confirmed = yield this.confirmLeaveGameMatch(nextStep);
                this.navigationGuardActive = false;
                if (!confirmed) {
                    // Revert hash to current step (pushState so it does not create another history entry)
                    (_b = (_a = this.currentGame) === null || _a === void 0 ? void 0 : _a.getGameConnection().socket) === null || _b === void 0 ? void 0 : _b.send(JSON.stringify({ type: 'RESUME_GAME' }));
                    history.pushState({}, '', `#${this.currentStep}`);
                    return;
                }
            }
            console.log("onpopstate event triggered");
            if (this.currentTournament && typeof this.currentTournament.getTournamentId === 'function') {
                const tournamentId = this.currentTournament.getTournamentId();
                const warningFlag = this.currentTournament.LeaveWithoutWarningFLAG;
                // if the tournament is in progress, show a warning message is it is not already shown when navigation arrow is clicked
                if (typeof tournamentId !== 'undefined' && tournamentId !== null && tournamentId > -42
                    && warningFlag !== true) {
                    showMessage("Tournament in progress aborted", 5000);
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
        });
        // Handle manual hash edits (not via navigate()/pushState). Avoid double firing if popstate already handled.
        window.addEventListener('hashchange', () => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const nextStep = location.hash.replace('#', '') || 'home';
            if (this.navigationGuardActive)
                return; // popstate already processed
            if (this.currentStep === 'game-match' && nextStep !== 'game-match') {
                this.navigationGuardActive = true;
                const confirmed = yield this.confirmLeaveGameMatch(nextStep);
                this.navigationGuardActive = false;
                if (!confirmed) {
                    // Restore original hash
                    (_b = (_a = this.currentGame) === null || _a === void 0 ? void 0 : _a.getGameConnection().socket) === null || _b === void 0 ? void 0 : _b.send(JSON.stringify({ type: 'RESUME_GAME' }));
                    window.location.hash = `#${this.currentStep}`;
                    return;
                }
            }
            // If confirmed or not a guarded leave, proceed
            this.loadStep();
        }));
        // Native browser reload / close guard
        window.onbeforeunload = (e) => {
            var _a, _b;
            if (this.currentStep === 'game-match' && ((_b = (_a = this.currentGame) === null || _a === void 0 ? void 0 : _a.isGameActive) === null || _b === void 0 ? void 0 : _b.call(_a))) {
                e.preventDefault();
                e.returnValue = '';
                return '';
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
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            // Intercept programmatic navigation
            if (this.currentStep === 'game-match' && step !== 'game-match') {
                const confirmed = yield this.confirmLeaveGameMatch(step);
                if (!confirmed) {
                    (_b = (_a = this.currentGame) === null || _a === void 0 ? void 0 : _a.getGameConnection().socket) === null || _b === void 0 ? void 0 : _b.send(JSON.stringify({ type: 'RESUME_GAME' }));
                    return;
                }
            }
            history.pushState({}, '', `#${step}`);
            console.log("current hash: ", window.location.hash);
        console.log("Navigating to step: ", step);
        this.loadStep();
        });
    }
    loadStep() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
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
            // DEBUG: show why the "leaving game-match" branch may not run
            try {
                console.debug('SPA.leave-check', {
                    currentStep: this.currentStep,
                    nextStep: step,
                    hasCurrentGame: !!this.currentGame,
                    getGameConnectionResult: (_b = (_a = this.currentGame) === null || _a === void 0 ? void 0 : _a.getGameConnection) === null || _b === void 0 ? void 0 : _b.call(_a),
                    hasSocket: !!((_e = (_d = (_c = this.currentGame) === null || _c === void 0 ? void 0 : _c.getGameConnection) === null || _d === void 0 ? void 0 : _d.call(_c)) === null || _e === void 0 ? void 0 : _e.socket),
                    isGameActive: (_g = (_f = this.currentGame) === null || _f === void 0 ? void 0 : _f.isGameActive) === null || _g === void 0 ? void 0 : _g.call(_f),
                    currentTournament: this.currentTournament
                });
            }
            catch (e) {
                console.debug('SPA.leave-check error', e);
            }
            console.log("this.currentStep: ", this.currentStep);
            console.log("step: ", step);
            // Handle leaving game-match step on active game
            if (this.currentStep === 'game-match')
                yield this.gameMatchNavigation(this.currentStep, step);
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
    gameMatchNavigation(currentStep, nextStep) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            if (!this.currentGame)
                return;
            const routeConfig = this.routes[nextStep];
            // Navigating OUT OF game-match
            if (currentStep === 'game-match' && nextStep != 'game-match') {
                const log = this.currentGame.getGameLog();
                const match = this.currentGame.getGameMatch();
                // Remote mode - pause and keep the game alive for a set time
                if (log.mode === 'remote' && this.currentGame.getGameConnection() &&
                    this.currentGame.getGameConnection().socket && this.currentGame.isGameActive()) {
                    const username = this.currentGame.getGameIsHost()
                        ? (_a = log.playerDetails.player1) === null || _a === void 0 ? void 0 : _a.username
                        : (_b = log.playerDetails.player2) === null || _b === void 0 ? void 0 : _b.username;
                    (_d = (_c = this.currentGame.getGameConnection()) === null || _c === void 0 ? void 0 : _c.socket) === null || _d === void 0 ? void 0 : _d.send(JSON.stringify({
                        type: 'PAUSE_GAME',
                        reason: `${username} left the game`
                    }));
                }
                // Any other game-mode, kill game on the backend and do not save log on database
                else if (log.mode != 'remote' && this.currentGame.getGameConnection() &&
                    this.currentGame.getGameConnection().socket && this.currentGame.isGameActive()) {
                    this.currentGame.getGameConnection().killGameSession(this.currentGame.getGameLog().id);
                }
                // If instance of match on browser, clean-remove (to prevent duplicated listeners on resume)
                if (match) {
                    match.updatePlayerActivity(false);
                    match.destroy();
                }
            }
            // RELOADING game-match - this is going to be resume online, reload will be much simpler
            else if (currentStep === 'game-match' && nextStep === 'game-match') {
                if (this.currentGame.getGameMatch())
                    (_e = this.currentGame.getGameMatch()) === null || _e === void 0 ? void 0 : _e.destroy();
                try {
                    const { sessions, userId } = yield this.currentGame.getGameConnection().checkActiveGameSessions();
                    const userGame = sessions.find((session) => {
                        var _a, _b;
                        return ((_a = session.playerDetails.player1) === null || _a === void 0 ? void 0 : _a.id) === userId ||
                            ((_b = session.playerDetails.player2) === null || _b === void 0 ? void 0 : _b.id) === userId;
                    });
                    if (!userGame) {
                        showMessage('No active game session found. Redirecting to home...', 2000);
                        this.navigate('home');
                        return;
                    }
                    // else: resume game as needed
                    else {
                        const module = yield import(`./${routeConfig.module}`);
                        const stepInstance = new module.default(this.currentGame, this.currentTournament);
                        if (this.currentGame && stepInstance)
                            this.currentGame.setGameMatch(stepInstance);
                    }
                }
                catch (e) {
                    showMessage('Error checking game session. Redirecting to home...', 2000);
                    this.navigate('home');
                }
            }
        });
    }
    // Centralized confirmation logic for leaving game-match
    confirmLeaveGameMatch(nextStep) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            // If there's no active game object or game not active, allow silently
            if (!this.currentGame || !((_b = (_a = this.currentGame).isGameActive) === null || _b === void 0 ? void 0 : _b.call(_a)))
                return true;
            (_d = (_c = this.currentGame.getGameConnection()) === null || _c === void 0 ? void 0 : _c.socket) === null || _d === void 0 ? void 0 : _d.send(JSON.stringify({
                type: 'PAUSE_GAME',
                reason: 'User navigating away'
            }));
            const left = yield showConfirmDialog("You are about to leave the game. This will end your current session. Continue?", this.currentGame.pauseDuration);
            if (left && this.currentGame.getGameLog().mode != 'remote')
                (_e = this.currentGame.getGameConnection()) === null || _e === void 0 ? void 0 : _e.killGameSession(this.currentGame.getGameLog().id);
            return left;
        });
    }
}
document.addEventListener('DOMContentLoaded', () => new SPA('content'));
