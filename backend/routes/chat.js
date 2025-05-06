import cookie from 'cookie';

export async function configureChatRoutes(fastify) {

	const clients = new Map();
	
	fastify.get('/chat', { websocket: true }, (socket, request) => {

		const rawCookie = request.headers.cookie || '';
		const cookies = cookie.parse(rawCookie);
		const token = cookies.token;

		console.log('Token extraído: ', token);

		// const clientId = request.query.clientId;
		// if (!clientId) {
		// 	socket.close(4000, 'Client ID is required');
		// 	return;
		// }
		// clients.set(clientId, socket);
		// console.log(`Client ${clientId} connected`);
		
		// socket.on('message', message => {
		// 	console.log(`Received message from ${clientId}: ${message}`);
		// 	// Broadcast the message to all connected clients
		// 	for (const [id, client] of clients) {
		// 		if (id !== clientId) {
		// 			client.send(`Message from ${clientId}: ${message}`);
		// 		}
		// 	}
		// })
		// socket.on('close', () => {
		// 	clients.delete(clientId);
		// 	console.log(`Client ${clientId} disconnected`);
		// });
		// socket.on('error', error => {
		// 	console.error(`WebSocket error for client ${clientId}:`, error);
		// });
		// socket.send(`Welcome to the chat, ${clientId}!`);
	})
}
