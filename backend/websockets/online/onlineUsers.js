import { extractUserFromToken } from "../../auth/token.js";


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