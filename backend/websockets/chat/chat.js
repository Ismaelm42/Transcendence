import { parse } from 'cookie';
import { crud } from '../../crud/crud.js'
import { extractUserFromToken } from '../../auth/token.js';

const clients = new Map();
const rooms = new Map();
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

// Create a message JSON object and sent it to the clients
function sendJSON(user, partner, message, roomId) {

	console.log(message);
	setTimer(user);
	if (!partner) {
		const response = {
			type: "message",
			imagePath: user.avatarPath,
			username: user.username,
			message: message,
			timeStamp: getTimeStamp()
		}
		for (const [id, client] of clients) {
			client.send(JSON.stringify(response));
		}
	}
	else {
		const response = {
			type: "private",
			imagePath: user.avatarPath,
			username: user.username,
			message: message || null,
			timeStamp: getTimeStamp(),
			partnerImagePath: partner.avatarPath,
			partnerUsername: partner.username,
			roomId: roomId,
		}
		// Maybe send to differente messages can be an idea
		clients.get(user.id)?.send(JSON.stringify(response));
		clients.get(partner.id)?.send(JSON.stringify(response));
	}
}


// Update the connected users list
function updateConnectedUsers(user, isConnected, status) {

	if (isConnected) {
		connected.set(user.id, {id:user.id, username:user.username, imagePath:user.avatarPath, status:status});
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

// Create a room for private message between two users
async function handlePrivate(user, data) {

	let partner;
	if (data.id) {
		const partnerId = parseInt(data.id, 10);
		if (user.id !== partnerId) {
			const [a, b] = [user.id, partnerId].sort((x, y) => x - y);
			const roomId = `${a}:${b}`;
			if (!rooms.has(roomId)) {
				rooms.set(roomId, {
					userSocket: clients.get(user.id),
					partnerSocket: clients.get(partnerId)
				})
			}
			partner = await crud.user.getUserById(partnerId);
			sendJSON(user, partner, null, roomId);
		}
	}
	else {
		const ids = data.roomId.split(":");
		if (parseInt(ids[0], 10) === user.id) {
			partner = await crud.user.getUserById(parseInt(ids[1], 10));
		}
		else {
			partner = await crud.user.getUserById(parseInt(ids[0], 10));
		}
		sendJSON(user, partner, data.message, data.roomId);
	}
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
			if (data.type === "message") {
				sendJSON(user, null, data.message, null);
			}
			else if (data.type === "status") {
				setTimer(user);
			}
			else if (data.type === "private") {
				handlePrivate(user, data)
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
