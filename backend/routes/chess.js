import { registerUser, handleIncomingSocketMessage, handleSocketClose, handleSocketError } from '../websockets/chess/chess.js';

export function configureChessRoutes(fastify) {

	fastify.register(async function (fastify) {
		fastify.get('/ws/chess', { websocket: true }, async (socket, request) => {

			const user = await registerUser(request, socket);
			handleIncomingSocketMessage(user, socket);
			handleSocketClose(user, socket);
			handleSocketError(user, socket);			
		})
	})
}
