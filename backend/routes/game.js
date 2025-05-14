
import { registerGameClient, handleGameDisconnect} from '../utils/wsGameUtils.js';
import { handleGameMessage} from '../game/manager/handlers.js';

/**
 *	What happens when a client connects:
 *		A client connects to ws://yourserver.com/ws/game
 *		Fastify triggers the WebSocket handler
 *		Four main functions are called in order:
 *		- registerGameClient: Authenticates the user and tracks the connection
 *		- handleGameMessage: Sets up message handling
 *		- handleGameDisconnect: Handles cleanup when a player leaves
 *		- handleGameError: Handles connection errors
 *	TODO: implement handleGameError at ../utils/wsGameUtils.js
 */
export function configureGameRoutes(fastify)
{
	fastify.register(async function (fastify) {
		fastify.get('/ws/game', { websocket: true }, async (connection, request) => {
			const	client = await registerGameClient(request, connection);
			handleGameMessage(client, connection);
			handleGameDisconnect(client, connection);
			//handleGameError(client, connection);
		})
	})
}
