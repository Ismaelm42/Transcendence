/**
 * enventManager.js file: server-side websocket workflow manager
 * Functions to set up the socket event listeners/handlers when connection is established
 */
import { extractUserFromToken } from "../../auth/token.js";
import { handleJoinGame, handlePlayerInput, handleLeaveGame, handlePlayerInfo, handleClientReady, handleRestartGame, handleGamesList, handleGetReadyState, handlePauseGame, handleResumeGame } from "./messageManager.js";
export const gamesList = new Map();
export const clients = new Map();

/**
 *	The client's auth token is extracted from cookies
 *	The user is authenticated (same flow as your chat system)
 *	The connection is stored in the clients Map for later reference
 */
export async function	registerGameClient(request, connection)
{
	console.log("STEPPED INTO -> registerGameClient");
	// First, extract user from cookies - as in chat logic (or as I understood it)
	const	token = request.cookies.token;
	if (!token)
	{
		console.error("No auth token found");
		connection.send(JSON.stringify({
			type: 'ERROR',
			message: 'Authentication required'
		}));
		return (null);
	}
	const	user = await extractUserFromToken(token);
	if (user && user.id)
	{
		console.log(`User authenticated: ${user.id}`);
		// Register and track connection
		clients.set(user.id, {
			connection,
			roomId: null
		})
		//console.log("Connection socket object of registred user:\n", clients.get(user.id).connection);
		return ({user, connection});
	}
	else
	{
		console.error("Invalid user extracted from token");
		connection.send(JSON.stringify({
			type: 'ERROR',
			message: 'Invalid user authentication'
		}));
		return (null);
	}
}

/**
 * messageManager() is the manager for messages, it calls the specific handler functions
 * JOIN_GAME	Player wants to join/create a game	{ roomId: "abc123", gameMode: "1v1" }
 * PLAYER_INPUT	Player moves paddle	{ input: { up: true, down: false } }
 * LEAVE_GAME	Player quits	(no additional data)
 */
export function	messageManager(client, connection)
{
	try
	{
	setTimeout(() => {
		console.log("Sending test message to client");
		connection.send(JSON.stringify({
			type: 'SERVER_TEST',
			message: 'Testing connection'
		}));
	}, 1000);
	} catch (error) {
		console.error("Error sending test message:", error);
	}

	connection.on('message', (message) => {
		try
		{
			const data = JSON.parse(message.toString());
			console.log("JSON message received FRONT->BACK:\n", data);
			switch (data.type)
			{
				case 'JOIN_GAME':
					handleJoinGame(client, data);
					break ;
				case 'CLIENT_READY':
					handleClientReady(client, data);
					break ;
				case 'PLAYER_INPUT':
					handlePlayerInput(client, data);
					break ;
				case 'LEAVE_GAME':
					handleLeaveGame(client);
					break ;
				case 'RESTART_GAME':
					handleRestartGame(client, data);
					break ;
				case 'PING':
					connection.send(JSON.stringify({ type: 'PONG' }));
					break ;
				case 'GET_USER':
					handlePlayerInfo(client, data);
					break ;
				case 'SHOW_GAMES':
					handleGamesList(client);
					break ;
				case 'GET_READY_STATE':
					handleGetReadyState(client);
					break ;
				case 'PAUSE_GAME':
					handlePauseGame(client, data);
					break;
				case 'RESUME_GAME':
					handleResumeGame(client, data);
					break;
				default:
					console.log(`Unknown message type: ${data.type}`);
			}	
		}
		catch (error){
			console.error('Game message error:', error);
		}
		console.log("Updated connection event listeners:", Object.keys(connection._events));
	});
}

/**
 * handleGameDisconnect() is called when the client disconnects from the game
 * It cleans up the game session and notifies other players
 * TO DO: check if this is needed, as it is also handled with LEAVE_GAME message
 */
export function	handleGameDisconnect(client, connection)
{
	connection.on('close', () => {
		handleLeaveGame(client);
	});
}

/**
 * handler to be called wen connection reports an error, it sends an error message to
 * the client and handles the leave game logic if the error is critical
 */
export function handleGameError(client, connection)
{
	connection.on('error', (error) => {
		const { user } = client;

		console.log(`Game error for user ${user.id}:`, error);
		try
		{
			connection.send(JSON.stringify({
				type: 'ERROR',
				message: 'An unexpected error occurred during gameplay'
			}));
		}
		catch (sendError){
			console.error('Failed to send error message to client:', sendError);
		}

		if (error.critical)
			handleLeaveGame(client);
	});
}

