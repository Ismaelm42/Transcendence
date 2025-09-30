import { registerUser, handleIncomingSocketMessage, handleSocketClose, handleSocketError } from '../websockets/chat/chat.js';

export function configureChatRoutes(fastify) {

	fastify.register(async function (fastify) {
		fastify.get('/ws/chat', { websocket: true }, async (socket, request) => {

			const user = await registerUser(request, socket);
			await handleIncomingSocketMessage(user, socket);
			handleSocketClose(user, socket);
			handleSocketError(user, socket);
		})
	})
}
