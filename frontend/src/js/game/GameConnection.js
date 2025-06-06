/**
 * GameConnection.ts -> WebSocket connection handling
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// This is a variable to store the first websocket connection
// so we can use the same one during the whole browser lifecycle
// (if page close or reloaded, socket is closed and lost)
let globalGameSocket = null;
export class GameConnection {
    constructor(game) {
        this.socket = null;
        this.connectionStat = false;
        this.pendingUserInfoResolve = null;
        this.game = game;
    }
    establishConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                // 0. Check if there is already an existing socket, to avoid creating new one
                //		if so, reset stats and skip rest (as configuration is already set)
                if (globalGameSocket && globalGameSocket.readyState === WebSocket.OPEN) {
                    console.log("Websocket reused =)");
                    this.socket = globalGameSocket;
                    this.connectionStat = true;
                    resolve();
                    return;
                }
                // 1. Socket create/registred - ping test - buttons appear
                this.socket = new WebSocket(`https://${window.location.host}/back/ws/game`);
                globalGameSocket = this.socket;
                // 1.1 Set what we want to happen on open socket (at first connected)
                this.socket.onopen = () => {
                    console.log('New socket connected to game server');
                    this.connectionStat = true;
                    resolve();
                };
                // 2. Setting message received handler for all desired cases
                this.socket.onmessage = (event) => {
                    var _a;
                    console.log("Message received from server:", event.data);
                    try {
                        const data = JSON.parse(event.data);
                        console.log("Parsed server message:", data);
                        switch (data.type) {
                            case 'USER_INFO':
                                if (this.pendingUserInfoResolve) {
                                    this.pendingUserInfoResolve(data.user);
                                    this.pendingUserInfoResolve = null;
                                }
                                break;
                            case 'GAME_INIT':
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
                                this.game.getGameMatch().showGameResults(this.game.getGameLog());
                                break;
                            case 'SERVER_TEST':
                                console.log("Server test message:", data.message);
                                // Respond to confirm bidirectional communication
                                (_a = this.socket) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify({
                                    type: 'PING',
                                    message: 'Client response to server test'
                                }));
                                break;
                            case 'PONG':
                                console.log("Server responded to ping");
                                break;
                            default:
                                console.log(`Received message with type: ${data.type}`);
                        }
                    }
                    catch (error) {
                        console.error("Error parsing server message:", error);
                    }
                };
                // 3. Error handler
                this.socket.onerror = (error) => {
                    console.error("WebSocket error:", error);
                    reject(error); // Reject the promise on error
                };
                // 4. Connection closed handler: set bool flag to false and hide play buttons
                //		and set globalGameSocket to null so next time a new socket will get created
                this.socket.onclose = (event) => {
                    console.log(`WebSocket connection closed: Code ${event.code}${event.reason ? ' - ' + event.reason : ''}`);
                    this.connectionStat = false;
                    if (globalGameSocket === this.socket)
                        globalGameSocket = null;
                };
            });
        });
    }
    /**
     * Send game mode selection to server with optional metadata
     * @param mode Game mode
     * @param tournamentId Optional tournament ID
     */
    joinGame(mode, tournamentId) {
        console.log("GAME LOG BEFORE JOIN SENDING: ", this.game.getGameLog());
        if (!this.socket || !this.connectionStat) {
            console.error("Cannot join game: connection not ready");
            return;
        }
        if (tournamentId)
            this.game.setTournamentId(tournamentId);
        const joinMsg = {
            type: 'JOIN_GAME',
            mode: mode,
            roomId: this.game.getGameLog().id,
            player1: this.game.getGameLog().player1,
            player2: this.game.getGameLog().player2,
            config: this.game.getGameLog().config
        };
        if (tournamentId)
            joinMsg.tournamentId = tournamentId;
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
    destroy() {
        if (this.socket)
            this.socket.close();
    }
}
