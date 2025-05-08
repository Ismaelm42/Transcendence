import {parse} from 'cookie';
import { extractUserFromToken } from '../auth/token.js';

function createMessageJSON(user, message) {
	return {
		image: user.image,
		username: user.username,
		message: message,
		timeStamp: getTimeStamp(),
		// timeStamp: new Date().toLocaleString(),
		messageStatus: "Sent!"
	}
}

function getTimeStamp() {
	const now = new Date();
	const hours = now.getHours().toString().padStart(2, '0');
	const minutes = now.getMinutes().toString().padStart(2, '0');
	return `${hours}:${minutes}`;
}

export function configureChatRoutes(fastify) {

	const clients = new Map();

	fastify.register(async function (fastify) {
	  fastify.get('/ws/chat', { websocket: true }, async (socket, req) => {

		const cookies = parse(req.headers.cookie || '');
		const token = cookies.token;
		const user = await extractUserFromToken(token);
		clients.set(user.id, socket);

		socket.on('message', message => {
			console.log("Mensaje del front:", message.toString());
			const response = createMessageJSON(user, message.toString());
			
			for (const [id, client] of clients) {
				client.send(JSON.stringify(response));
			}
		})

		socket.on('close', () => {
			clients.delete(user.id);
			console.log(`Client ${user.username} disconnected`);
		});

	  })
	})


}

// Mensaje del cliente de frontend
// Necesito que me devuelvas un JSON con estos campos:

// image - Avatar del usuario
// username - Nombre del usuario
// message - Mensaje
// timeStamp - Fecha y hora
// messageStatus - Status -> Sent!
