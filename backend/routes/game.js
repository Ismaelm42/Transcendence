
import { registerGameClient, handleGameDisconnect, messageManager, handleGameError} from '../game/manager/eventManager.js';

/**
 *	What happens when a client connects:
 *		A client connects to ws://yourserver.com/ws/game
 *		Fastify triggers the WebSocket handlers
 *		Four main functions are called in order to set the listeners for different sockets evets;
 *		- registerGameClient: Authenticates the user and tracks the connection
 *		- messageManager: connection.on(message) - Sets up message handling for all different types of messages
 *		- handleGameDisconnect: connection.on(close) - Handles cleanup when a player leaves
 *		- handleGameError: connection.on(error) - Handles connection errors
 */
export function configureGameRoutes(fastify)
{
	fastify.register(async function (fastify) {
		fastify.get('/ws/game', { websocket: true }, async (connection, request) => {
			const	client = await registerGameClient(request, connection);
			messageManager(client, connection);
			handleGameDisconnect(client, connection);
			handleGameError(client, connection);
		})
	})
}
