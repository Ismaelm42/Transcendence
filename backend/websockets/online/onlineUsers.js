import { extractUserFromToken } from "../../auth/token.js";
import GameSession from "../../game/engine/GameSession.js";

const onlineUsers = new Map();

export function configureOnlineSocket(fastify) {
	fastify.register(async function (fastify) {
		fastify.get('/ws/online', { websocket: true }, async (socket, req) => {

			const token = req.cookies.token;
			const user = await extractUserFromToken(req.cookies.token);
			if (!user) {
				console.error('User invalido, cerrando socket');
				socket.close();
				return;
			}
			// 1. Asigna el userId al socket
			socket.userId = user.id;

			// 2. Añade al usuario al mapa de conectados
			onlineUsers.set(user.id, { userId: String(user.id), username: user.username, status: 'green' });

			// 3. Notifica a todos los clientes la lista actualizada
			broadcastOnlineUsers(fastify);

			// 4. Elimina al usuario cuando se desconecte
			socket.on('close', () => {
				onlineUsers.delete(user.id);
				broadcastOnlineUsers(fastify);
			});
			handleOnlineMessages(fastify, socket);
		});
	});
}

function broadcastOnlineUsers(fastify) {
	const usersArray = Array.from(onlineUsers.values());
	for (const client of fastify.websocketServer.clients) {
		client.send(JSON.stringify({
			type: 'onlineUsers',
			users: usersArray
		}));
	}
}

export function notifyRelationsUpdate(fastify, userIds) {
	// asegura que userIds son strings
	const ids = userIds.map(id => String(id));
	for (const client of fastify.websocketServer.clients) {
		// client.userId lo asignas al conectar: socket.userId = String(user.id)
		if (client && client.userId && ids.includes(String(client.userId))) {
			try {
				client.send(JSON.stringify({ type: "refreshRelations" }));
			} catch (err) {
				// ignore send errors for disconnected clients
			}
		}
	}
}

// Añade este mapa global para trackear challenges pendientes
const pendingChallenges = new Map(); // requestId -> { fromId, targetId, ts }

// ...existing code...

function handleOnlineMessages(fastify, socket) {
	socket.on('message', async (message) => {
		let msg;
		try {
			msg = JSON.parse(message.toString());
		} catch (err) {
			console.error('Invalid message format', err);
			return;
		}

		console.log('Mensaje recibido en handleOnlineMessages:', msg); // Log para depurar

		if (msg.type === "challenge" && msg.targetId) {
			const targetId = String(msg.targetId);
			const fromId = String(socket.userId);
			const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

			// Guarda el challenge pendiente
			pendingChallenges.set(requestId, { fromId, targetId, ts: Date.now() });

			// Busca el socket del usuario objetivo
			for (const client of fastify.websocketServer.clients) {
				if (!client || !client.userId || client.readyState !== 1) continue; // Añade check de readyState
				if (String(client.userId) === targetId) { // Convierte a string para comparar
					try {
						client.send(JSON.stringify({
							type: "incomingChallenge",
							requestId,
							fromId,
							ts: Date.now()
						}));
						console.log(`Challenge enviado a ${targetId} desde ${fromId}`); // Log
					} catch (err) {
						console.error('Error enviando challenge:', err);
					}
					break;
				}
			}
		}

		// Manejar aceptación del challenge
		if (msg.type === "acceptChallenge" && msg.requestId) {
			const pending = pendingChallenges.get(msg.requestId);
			if (!pending) {
				console.log('Challenge no encontrado para requestId:', msg.requestId);
				return;
			}
			const { fromId, targetId } = pending;

			// Crea gameId y gameMode
			const gameId = `${Date.now()}`;
			const gameMode = '1v1';
			const url = `/game/${gameId}`;

			// Envía "JOIN_GAME" al WebSocket de juego (primer bucle, correcto)
			for (const client of fastify.websocketServer.clients) {
				if (!client || !client.userId || client.readyState !== 1) continue;
				const clientId = String(client.userId);
				if (clientId === fromId || clientId === targetId) {
					try {
						client.send(JSON.stringify({
							type: "JOIN_GAME",
							roomId: gameId,
							gameMode
						}));
						console.log(`JOIN_GAME enviado a ${clientId} para roomId ${gameId}`);
					} catch (err) {
						console.error('Error enviando JOIN_GAME:', err);
					}
				}
			}

			// Envía "gameStarted" al WebSocket online (segundo bucle, corregido)
			for (const client of fastify.websocketServer.clients) {
				if (!client || !client.userId || client.readyState !== 1) continue;
				const clientId = String(client.userId);
				if (clientId === fromId || clientId === targetId) {
					try {
						client.send(JSON.stringify({
							type: "gameStarted",
							gameId,
							url,
							gameMode
						}));
						console.log(`gameStarted enviado a ${clientId}`);
					} catch (err) {
						console.error('Error enviando gameStarted:', err);
					}
				}
			}
			pendingChallenges.delete(msg.requestId); // Limpia
		}

		// Manejar rechazo del challenge
		if (msg.type === "rejectChallenge" && msg.requestId) {
			const pending = pendingChallenges.get(msg.requestId);
			if (!pending) {
				console.log('Challenge no encontrado para requestId:', msg.requestId);
				return;
			}
			const { fromId } = pending;

			// Notifica solo al iniciador
			for (const client of fastify.websocketServer.clients) {
				if (!client || !client.userId || client.readyState !== 1) continue;
				if (String(client.userId) === fromId) {
					try {
						client.send(JSON.stringify({ type: "challengeRejected", requestId: msg.requestId }));
						console.log(`challengeRejected enviado a ${fromId}`); // Log
					} catch (err) {
						console.error('Error enviando challengeRejected:', err);
					}
					break;
				}
			}
			pendingChallenges.delete(msg.requestId); // Limpia
		}
	});
}