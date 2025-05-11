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

// Controlar los mensajes muy largos del front
// Controlar que el username no sea de más de 20 caracteres
// Guardar los mensajes en la cache o algo del navegador para que no se pierdan cuando
// se cambia de pestaña
// Implementar la búsqueda de usuario dinámica
// Implementar el puntito naranja cuando un usuario lleva tiempo sin escribir
