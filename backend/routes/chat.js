import {parse} from 'cookie';
import { extractUserFromToken } from '../auth/token.js';

export function configureChatRoutes(fastify) {

	const clients = new Map();

	fastify.register(async function (fastify) {
	  fastify.get('/ws/chat', { websocket: true }, async (socket, req) => {

		const cookies = parse(req.headers.cookie || '');
		const token = cookies.token;
		const user = await extractUserFromToken(token);
		clients.set(user.id, socket);



		socket.on('message', message => {
		console.log("Mensaje del front:", message.toString())
		//   message.toString() === 'hi from client'
		  socket.send('hi from server')
		})



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
