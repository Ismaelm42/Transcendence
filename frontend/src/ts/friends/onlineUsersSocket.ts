import { GameConnection } from "../game/GameConnection.js";
import Game from "../game/Game.js";

export let onlineSocket: WebSocket | null = null;

export function initOnlineSocket() {
	if (!onlineSocket || onlineSocket.readyState === WebSocket.CLOSED) {
		onlineSocket = new WebSocket("wss://localhost:8443/back/ws/online");
		console.log("Online socket initialized");

		onlineSocket.onopen = () => {
			console.log("Online socket connection established");
		};

		onlineSocket.onmessage = (event) => {
			const data = JSON.parse(event.data);
			if (data.type === "onlineUsers") {
				console.log("Usuarios online recibidos:", data.users);
				sessionStorage.setItem("userConnected", JSON.stringify(data.users));
				window.dispatchEvent(new Event("onlineUsersUpdated"));
			}
			else if (data.type === "refreshRelations") {
				console.log("Refresh relations event received");
				window.dispatchEvent(new Event("onlineUsersUpdated"));
			}
			if (data.type === "incomingChallenge") {
				alert
				const fromName = data.from?.username || data.from?.id || "Opponent";
				const accept = confirm(`${fromName} te desafía a jugar. ¿Aceptar?`);
				if (accept) {
					onlineSocket?.send(JSON.stringify({ type: "acceptChallenge", requestId: data.requestId }));
				} else {
					onlineSocket?.send(JSON.stringify({ type: "rejectChallenge", requestId: data.requestId }));
				}
				return;
			}
			if (data.type === "gameStarted") {
				console.log("Evento gameStarted recibido:", data); // Log específico para gameStarted

				const gameId = data.gameId;
				const gameMode = data.gameMode;

				console.log("Creando Game y GameConnection..."); // Log antes de crear
				const game = new Game();
				const gameConnection = new GameConnection(game);
				console.log("Llamando establishConnection..."); // Log antes de conectar

				gameConnection.establishConnection().then(() => {
					console.log("Conectado al WebSocket de juego, llamando joinGame..."); // Log en then
					gameConnection.joinGame(gameId);
					console.log("Game started with ID:", gameId, "Mode:", gameMode);

					// Añade un listener temporal para logs (sin modificar GameConnection)
					if (gameConnection.socket) {
						gameConnection.socket.addEventListener('message', (event) => {
							const msg = JSON.parse(event.data);
							console.log("Mensaje recibido del WebSocket de juego:", msg);
							if (msg.type === "GAME_INIT") {
								console.log("GAME_INIT recibido, debería navegar a la partida");
							}
						});
					}
				}).catch((error) => {
					console.error("Error establishing game connection:", error); // Log en catch
				});
				return;
			}
		};

		onlineSocket.onclose = () => {
			console.log("Online socket closed");
			onlineSocket = null;
		};

		onlineSocket.onerror = (err) => {
			console.error("Error en el WebSocket de usuarios online:", err);
		};
	}
}

export function closeOnlineSocket() {
	if (onlineSocket) {
		onlineSocket.close();
		onlineSocket = null;
	}
}