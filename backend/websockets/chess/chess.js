import { parse } from 'cookie';
import { crud } from '../../crud/crud.js'
import { extractUserFromToken } from '../../auth/token.js';

const clients = new Map();
const lobby = new Map();
// const games = new Map();
// const chessboards = new Map();

export async function registerUser(request, socket) {

	const cookies = parse(request.headers.cookie || '');
	const token = cookies.token;
	const user = await extractUserFromToken(token);
	clients.set(user.id, socket);
	return user;
}

function createGameLobby(user, data) {

	lobby.set(user.id, data);
	for (const [id, client] of clients) {
		for (const [id, data] of lobby) {
			client.send(JSON.stringify(data));
		}
	}
}

export async function handleIncomingSocketMessage(user, socket) {

	socket.on('message', async message => {
		try {
			const data = JSON.parse(message.toString());
			if (data.type === 'config') {
				if (data.gameMode === 'online') {
					createGameLobby(user, data);
					createOnlineGame();
				}
				else
					createLocalGame();
			}
			if (data.type === 'move') {
			}
		} catch (error) {
			console.log("An error occured:", error);
		}
	})
}

export function handleSocketClose(user, socket) {

	socket.on('close', () => {
	});
}

export function handleSocketError(user, socket) {

	socket.on('error', (error) => {
		console.log(`WebSocket error :`, error);
	});
}
