import { extractUserFromToken } from "../../auth/token.js";
//import { GameSession } from "../../game/engine/GameSession.js";

const onlineUsers = new Map();

export function isUserOnline(userId) {
	return onlineUsers.has(String(userId));
}

export function configureOnlineSocket(fastify) {
	fastify.register(async function (fastify) {
		fastify.get('/ws/online', { websocket: true }, async (socket, req) => {
		
			const token = req.cookies.token;
			const user = await extractUserFromToken(req.cookies.token);
			if (!user) {
				socket.close();
				return;
			}

			// Check if user is already online
			if (onlineUsers.has(String(user.id))) {
				console.log(`User ${user.username} already connected. Rejecting new connection.`);
				socket.send(JSON.stringify({ type: 'error', message: 'You are already logged in from another location.' }));
				socket.close();
				return;
			}
			// 1. Asigna el userId al socket
			socket.userId = String(user.id);

			socket.token = token;

			// 2. Añade al usuario al mapa de conectados
			onlineUsers.set(String(user.id), { userId: String(user.id), username: user.username, status: 'green' });

			// 3. Notifica a todos los clientes la lista actualizada
			broadcastOnlineUsers(fastify);

			// 4. Elimina al usuario cuando se desconecte
			socket.on('close', () => {
				// Ensure key types match when deleting (stored as String(user.id))
				onlineUsers.delete(String(user.id));
				broadcastOnlineUsers(fastify);
			});
			handleOnlineSocketMessages(fastify, socket, user);
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

const pendingChallenges = new Map();//requestId -> { fromUserId, toUserId, timestamp }

function handleOnlineSocketMessages(fastify, socket, user) {
	socket.on('message', async (message) => {
		const data = JSON.parse(message);
		switch (data.type) {
			case 'challenge':
				console.log("Challenge received:", data);
				handleChallenge(fastify, socket, user, data);
				break;
			case 'acceptChallenge':
				console.log("Challenge accepted:", data);
				handleAcceptChallenge(fastify, socket, user, data);
				break;
			case 'declineChallenge':
				// Handle challenge decline
				break;
			default:
				console.error('Unknown message type:', data.type);
		}
	});
}

async function handleChallenge(fastify, socket, user, data) {
	const fromUserId = String(user.id);
	const fromUsername = user.username;
	const toUserId = String(data.toUserId);
	const challengeId = `${fromUserId}-${toUserId}-${Date.now()}`;

	pendingChallenges.set(challengeId, { fromUserId, toUserId, fromUsername, timestamp: Date.now() });

	// Notify the challenged user
	const targetSocket = Array.from(fastify.websocketServer.clients).find(client => String(client.userId) === toUserId);
	if (targetSocket) {
		try {
			targetSocket.send(JSON.stringify({
				type: 'incomingChallenge',
				fromUserId,
				fromUsername,
				challengeId
			}));
		} catch (error) {
			console.error('Error sending challenge:', error);
		}
	}
}

async function handleAcceptChallenge(fastify, socket, user, data) {
	const challengeId = String(data.challengeId ?? '');
	if (!challengeId) {
		console.error('acceptChallenge sin challengeId');
		return;
	}
	
	const pendingChallenge = pendingChallenges.get(challengeId);
	console.log("Handling accepted challenge:", challengeId, pendingChallenge);
	if (!pendingChallenge) {
        console.error('Challenge not found or expired:', challengeId);
        return;
    }

	const { fromUserId, toUserId } = pendingChallenge;


	const gameMode = '1vs1';
	const gameId = `game-${challengeId}`; // ID unico del juego
	const url = `/game/${challengeId}`; // URL del juego

	for (const client of fastify.websocketServer.clients) {
		const userIdStr = String(client.userId);
		if (userIdStr === fromUserId || userIdStr === toUserId) {
			const token = client.token; 
			console.log("Sending gotToGame message with token:", token);
			try {
				console.log(`Sending goToGame to user ${client.userId} for game ${gameId}`);
				client.send(JSON.stringify({
					type: 'goToGame',
					roomId: challengeId,
					gameMode,
					youAre: userIdStr === fromUserId ? 'player1' : 'player2'
				}));
			} catch (error) {
				console.error('Error notifying game start:', error);
			}
		}
	}

	pendingChallenges.delete(challengeId);
}
