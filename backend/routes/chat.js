import { parse } from 'cookie';
import { extractUserFromToken } from '../auth/token.js';

function createMessageJSON(user, message) {
	return {
		type: "message",
		imagePath: user.avatarPath,
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
				try {
					let data;
					try {
						data = JSON.parse(message.toString());
					} catch (error) {
						// Si no es JSON, tratarlo como un string simple
						data = { type: "message", message: message.toString() };
					}
					if (data.type === "handshake") {
						//console.log("Handshake received:", data);
						//socket.send(JSON.stringify({ type: "handshake", message: "Welcome to the chat!" }));
						return;
					}
					if (data.type === "message") {
						console.log("Message received:", data);
						const response = createMessageJSON(user, data.message);
						for (const [id, client] of clients) {
							client.send(JSON.stringify(response));
						}
					}
				} catch (error) {
					console.error("Error parsing message:", error);
				}
			})

			socket.on('close', () => {
				clients.delete(user.id);
				console.log(`Client ${user.username} disconnected`);
			});

		})
	})
}

// users {userId, username, avatarPath}
