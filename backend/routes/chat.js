import { registerUser, handleIncomingSocketMessage, handleSocketClose, handleSocketError } from '../utils/wsChatUtils.js';

export function configureChatRoutes(fastify) {

	const clients = new Map();
	const connected = new Map();

	fastify.register(async function (fastify) {
		fastify.get('/ws/chat', { websocket: true }, async (socket, request) => {

			const user = await registerUser(request, clients, socket, connected);
			handleIncomingSocketMessage(user, clients, socket);
			handleSocketClose(user, clients, socket, connected);
			handleSocketError(user, clients, socket, connected);
		})
	})
}

// users {userId, username, avatarPath}
