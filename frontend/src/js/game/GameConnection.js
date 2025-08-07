var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * GameConnection.ts -> WebSocket connection handling
 */
import { SPA } from '../spa/spa.js';
// This is a variable to store the first websocket connection
// so we can use the same one during the whole browser lifecycle
// (if page close or reloaded, socket is closed and lost)
let globalGameSocket = null;
export class GameConnection {
    /**
     * Creates an instance of GameConnection.
     * @param game - The Game instance that this connection will manage.
     */
    constructor(game) {
        this.socket = null; // WebSocket instance
        this.connectionStat = false; // Connection status
        /**
         * A callback function that is invoked to resolve pending user information requests.
         *
         * When set, this function should be called with the user data once it becomes available.
         * If there is no pending request, this property is `null`.
         *
         * @remarks
         * This is typically used in asynchronous flows where user information needs to be fetched or confirmed before proceeding.
         *
         * @param user - The user information object to be passed to the resolver.
         */
        this.pendingUserInfoResolve = null;
        this.game = game;
    }
    establishConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                // 0. Check if there is already an existing socket, to avoid creating new one
                if (globalGameSocket && globalGameSocket.readyState === WebSocket.OPEN) {
                    console.log("Websocket reused =)");
                    this.socket = globalGameSocket;
                    this.connectionStat = true;
                    // Remove old handlers before assigning new ones
                    this.socket.onmessage = null;
                    this.socket.onopen = null;
                    this.socket.onerror = null;
                    this.socket.onclose = null;
                    resolve();
                    return;
                }
                // 1. Socket create/registred - ping test - buttons appear
                this.socket = new WebSocket(`https://${window.location.host}/back/ws/game`);
                globalGameSocket = this.socket;
                this.socket.onopen = () => {
                    console.log('New socket connected to game server');
                    this.connectionStat = true;
                    resolve();
                };
                this.socket.onerror = (error) => {
                    console.error("WebSocket error:", error);
                    reject(error);
                };
                this.socket.onclose = (event) => {
                    console.log(`WebSocket connection closed: Code ${event.code}${event.reason ? ' - ' + event.reason : ''}`);
                    this.connectionStat = false;
                    if (globalGameSocket === this.socket)
                        globalGameSocket = null;
                };
            }).then(() => {
                // Always assign the message handler after connection is established
                if (this.socket) {
                    this.socket.onmessage = (event) => {
                        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                        console.log("Message received from server:", event.data);
                        try {
                            const data = JSON.parse(event.data);
                            // console.log("Parsed server message:", data);
                            switch (data.type) {
                                /*Cuando el servidor responde con un mensaje de tipo USER_INFO,
                                el manejador de mensajes del WebSocket verifica si pendingUserInfoResolve está definido.
                                Si es así, la llama pasando el usuario recibido y luego la limpia (la pone en null).*/
                                case 'USER_INFO':
                                    if (this.pendingUserInfoResolve) {
                                        this.pendingUserInfoResolve(data.user);
                                        this.pendingUserInfoResolve = null;
                                        this.game.setOnlineId(data.user.id);
                                    }
                                    else
                                        console.warn('No pendingUserInfoResolve to call!');
                                    break;
                                case 'GAME_INIT':
                                    const spa = SPA.getInstance();
                                    if (data.metadata)
                                        this.game.setGameLog(data.metadata);
                                    if (window.location.hash === '#game-match' && ((_a = spa.currentGame) === null || _a === void 0 ? void 0 : _a.getGameMatch())) {
                                        const appElement = document.getElementById('app-container');
                                        if (appElement)
                                            (_b = spa.currentGame.getGameMatch()) === null || _b === void 0 ? void 0 : _b.render(appElement);
                                    }
                                    else
                                        spa.navigate('game-match');
                                    console.log("Game initialized:", data);
                                    break;
                                case 'GAME_STATE':
                                    this.game.getGameRender().renderGameState(data.state);
                                    break;
                                case 'GAME_START':
                                    console.log("Game started:", data);
                                    this.game.startGameSession();
                                    break;
                                case 'GAME_END':
                                    this.game.endGameSession(data.result);
                                    (_c = this.game.getGameMatch()) === null || _c === void 0 ? void 0 : _c.showGameResults(this.game.getGameLog());
                                    break;
                                case 'SERVER_TEST':
                                    console.log("Server test message:", data.message);
                                    (_d = this.socket) === null || _d === void 0 ? void 0 : _d.send(JSON.stringify({
                                        type: 'PING',
                                        message: 'Client response to server test'
                                    }));
                                    break;
                                case 'PONG':
                                    console.log("Server responded to ping");
                                    break;
                                case 'GAMES_LIST':
                                    this.game.getGameUI().updateLobby(data.games || []);
                                    break;
                                case 'READY_STATE':
                                    (_e = this.game.getGameMatch()) === null || _e === void 0 ? void 0 : _e.updateReadyModal(data.playerDetails, data.readyStates);
                                    break;
                                case 'GAME_COUNTDOWN':
                                    const readyModal = document.getElementById('ready-modal');
                                    if (readyModal) {
                                        readyModal.style.display = 'none';
                                        (_f = this.game.getGameMatch()) === null || _f === void 0 ? void 0 : _f.stopReadyStatePolling();
                                    }
                                    (_g = this.game.getGameMatch()) === null || _g === void 0 ? void 0 : _g.showCountdown(data.seconds || 3, data.reason);
                                    break;
                                case 'GAME_PAUSED':
                                    (_h = this.game.getGameMatch()) === null || _h === void 0 ? void 0 : _h.showPauseModal(data.reason, data.userId);
                                    break;
                                case 'GAME_RESUMED':
                                    (_j = this.game.getGameMatch()) === null || _j === void 0 ? void 0 : _j.hidePauseModal();
                                    (_k = this.game.getGameMatch()) === null || _k === void 0 ? void 0 : _k.showCountdown(3, data.reason);
                                    break;
                                default:
                                    console.log(`Received message with type: ${data.type}`);
                            }
                        }
                        catch (error) {
                            console.error("Error parsing server message:", error);
                        }
                    };
                }
            });
        });
    }
    /**
     * Send game mode selection to server with optional metadata
     * @param mode Game mode
     * @param tournamentId Optional tournament ID
     */
    joinGame(gameId) {
        if (!this.socket || !this.connectionStat) {
            console.error("Cannot join game: connection not ready");
            return;
        }
        if (gameId) {
            this.game.setGameMode('remote');
            const joinMsg = {
                type: 'JOIN_GAME',
                roomId: gameId
            };
            this.socket.send(JSON.stringify(joinMsg));
            return;
        }
        const metadata = this.game.getGameLog();
        const joinMsg = {
            type: 'JOIN_GAME',
            mode: metadata.mode,
            roomId: metadata.id,
            player1: metadata.playerDetails.player1,
            player2: metadata.playerDetails.player2,
            config: metadata.config,
            tournamentId: metadata.tournamentId
        };
        this.socket.send(JSON.stringify(joinMsg));
    }
    /**
     * Aux method to parse user main data from database, will use API endpoint
     * If email and pass are passed (through setPlayerInfo) will change mode for API message
     * The GET_USER endpoint triggers backend method that will store user object
     */
    parseUserInfo(data) {
        return __awaiter(this, void 0, void 0, function* () {
            let mode = 'local';
            if (data) {
                try {
                    if (yield this.checkPlayer(data))
                        mode = 'external';
                }
                catch (error) {
                    console.error("Error while checking external player:", error);
                }
            }
            /*Cuando se solicita información del usuario, se crea una nueva promesa
            y se asigna su función resolve a pendingUserInfoResolve.*/
            return new Promise((resolve) => {
                var _a;
                this.pendingUserInfoResolve = resolve;
                (_a = this.socket) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify({
                    type: 'GET_USER',
                    mode: mode,
                    email: data === null || data === void 0 ? void 0 : data.email
                }));
            });
        });
    }
    /**
     * Verifies a player's credentials by sending a POST request to the backend.
     *
     * @param data - An object containing the player's email and password.
     * @returns A promise that resolves to `true` if the credentials are valid, or `false` if invalid.
     *          Logs errors to the console if the request fails or if the credentials are incorrect.
     */
    checkPlayer(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch("https://localhost:8443/back/verify_user", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                });
                if (!response.ok) {
                    const result = yield response.json();
                    console.log(`Error: ${result.message}`);
                    return (false);
                }
                else
                    return (true);
            }
            catch (error) {
                console.error("Error while verifying:", error);
            }
        });
    }
    ;
    /**
     * Cleans up the WebSocket connection by removing all event handlers and closing the socket.
     * Also clears any pending user information resolution callbacks.
     *
     * This method should be called when the connection is no longer needed to prevent memory leaks
     * and ensure proper resource cleanup.
     */
    destroy() {
        if (this.socket) {
            this.socket.onmessage = null;
            this.socket.onopen = null;
            this.socket.onerror = null;
            this.socket.onclose = null;
            this.socket.close();
        }
        this.pendingUserInfoResolve = null;
    }
}
