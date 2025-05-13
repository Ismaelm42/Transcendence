import { extractUserFromToken } from "../auth/token.js";
import {handleLeaveGame} from "../game/manager/handlers.js"

/**
 *	The client's auth token is extracted from cookies
 *	The user is authenticated (same flow as your chat system)
 *	The connection is stored in the clients Map for later reference
 */
export async function	registerGameClient(request, connection)
{
	// First, extract user from cookies - as in chat logic (or as I understood it)
	const	cookies = parse(request.headers.cookies || '');
	const	token = cookies.token;
	const	user = await extractUserFromToken(token);

	// Register and track connection
	clients.set(user.id, {
		connection,
		roomId: null
	})

	return ({user, connection});
}

export function	handleGameDisconnect(client, connection)
{
	connection.socket.on('close', () => {
		handleLeaveGame(client);
	});
}
