import { parse } from 'cookie';
import { extractUserFromToken } from '../auth/token.js';

const clients = new Map();
const connected = new Map();
const usersTimeout = new Map();

// Get the current time in a specific format
function getTimeStamp() {

	const now = new Date();
	const timeString = now.toLocaleTimeString('es-ES', {
		hour: '2-digit',
		minute: '2-digit',
		timeZone: 'Europe/Madrid'
	});
	return timeString;
}

// Create a message JSON object to be sent to the clients
function createMsgJSON(user, message) {

	return {
		type: "message",
		imagePath: user.avatarPath,
		username: user.username,
		message: message,
		timeStamp: getTimeStamp(),
	}
}

// Update the connected users list
function updateConnectedUsers(user, isConnected, status) {

	if (isConnected) {
		connected.set(user.id, {username: user.username, imagePath: user.avatarPath, status: status});
	}
	if (!isConnected) {
		connected.delete(user.id);
	}
	const connectedArray = Array.from(connected.values());
	return {
		type: "connectedUsers",
		object: connectedArray
	};
}

function sendStatusToAllClients(user, status) {

	if (clients.has(user.id))
	{
		const response = updateConnectedUsers(user, true, status);
		for (const [id, client] of clients) {
			client.send(JSON.stringify(response));
		}
	}
}

// Update the user's status connection 120000(2mn) 180000(3mn)
function setTimer(user) {

	const timeout = usersTimeout.get(user.id);
	if (timeout) {
		clearTimeout(timeout);
	}
	sendStatusToAllClients(user, "green");
	const yellowTimer = setTimeout(() => {
		sendStatusToAllClients(user, "yellow");
		const redTimer = setTimeout(() => {
			sendStatusToAllClients(user, "red");
		}, 5000);
		usersTimeout.set(user.id, redTimer);
	}, 5000);
	usersTimeout.set(user.id, yellowTimer);
}

// Register a user when they connect to the WebSocket server
export async function registerUser(request, socket) {

	const cookies = parse(request.headers.cookie || '');
	const token = cookies.token;
	const user = await extractUserFromToken(token);
	clients.set(user.id, socket);
	usersTimeout.set(user.id, null)
	setTimer(user);
	return user;
}

// Handle incoming messages from the WebSocket clients and broadcast them to all connected clients
export function handleIncomingSocketMessage(user, socket) {

	socket.on('message', message => {
		try {
			const data = JSON.parse(message.toString());
			if (data.type === "handshake") {
				return ;
			}
			else if (data.type === "message") {
				setTimer(user);
				const response = createMsgJSON(user, data.message);
				for (const [id, client] of clients) {
					client.send(JSON.stringify(response));
				}
			}
			else if (data.type === "status") {
				setTimer(user);
			}
		} catch (error) {
			console.log("An error occured:", error);
		}
	})
}

// Handle the closing of the WebSocket connection and update the connected users list
export function handleSocketClose(user, socket) {

	socket.on('close', () => {
		clients.delete(user.id);
		usersTimeout.delete(user.id);
		const response = updateConnectedUsers(user, false);
		for (const [id, client] of clients) {
			client.send(JSON.stringify(response));
		}
	});
}

// Handle errors that occur during the WebSocket connection and update the connected users list
export function handleSocketError(user, socket) {

	socket.on('error', (error) => {
		clients.delete(user.id);
		usersTimeout.delete(user.id);
		const response = updateConnectedUsers(user, false);
		for (const [id, client] of clients) {
			client.send(JSON.stringify(response));
		}
		console.log(`${user.id} WebSocket error :`, error);
	});
}

export function disconnectUser(user) {

	const socket = clients.get(user.id);
	if (socket) {
		socket.close(1000, "Server closed connection");
		clients.delete(user.id);
		usersTimeout.delete(user.id);
		const response = updateConnectedUsers(user, false);
		for (const [id, client] of clients) {
			client.send(JSON.stringify(response));
		}
	}
}
