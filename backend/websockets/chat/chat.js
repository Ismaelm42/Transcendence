import { parse } from 'cookie';
import { crud } from '../../crud/crud.js'
import { extractUserFromToken } from '../../auth/token.js';

let timerId = 0;
const rooms = new Map();
const clients = new Map();
const connected = new Map();
const usersTimeout = new Map();
const userRequestId = new Map();
const blockedIds = new Map();

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

// Get blocked users list
async function getBlockedUsers(user)
{
	if (!user) {
		const cookies = parse(request.headers.cookie || '');
		const token = cookies.token;
		user = await extractUserFromToken(token);	
	}
	const blockedUsers = await crud.friend.getAllFriendsEntriesFromUser(user.id, "blocked");
	const blockedSet = new Set();
	for (const blockedUser of blockedUsers) {
		const data = blockedUser.dataValues;
		const blockedId = data.userId === user.id ? data.friendId : data.userId;
		blockedSet.add(blockedId);
	}
	blockedIds.set(user.id, blockedSet);
}

// Create a message JSON object and sent it to the clients
async function sendJSON(user, partner, message, roomId) {

	await setTimer(user);
	if (!partner) {
		const response = {
			type: "message",
			userId: String(user.id),
			username: user.username,
			imagePath: user.avatarPath,
			message: message,
			timeStamp: getTimeStamp()
		}
		for (const [id, client] of clients) {
			if (!blockedIds.get(user.id)?.has(id)) {
				client.send(JSON.stringify(response));
			}
		}
	}
	else {
		const response = {
			type: "private",
			userId: String(user.id),
			username: user.username,
			imagePath: user.avatarPath,
			partnerId: String(partner.id),
			partnerUsername: partner.username,
			partnerImagePath: partner.avatarPath,
			message: message || null,
			timeStamp: getTimeStamp(),
			roomId: roomId,
		}
		clients.get(user.id)?.send(JSON.stringify(response));
		if (!blockedIds.get(user.id)?.has(partner.id)) {
			clients.get(partner.id)?.send(JSON.stringify(response));
		}
	}
}

// Update the connected users list
function updateConnectedUsers(user, isConnected, status) {

	if (isConnected) {
		connected.set(user.id, {
			userId: String(user.id),
			username: user.username,
			imagePath: user.avatarPath,
			status: status
		});
	}
	if (!isConnected) {
		connected.delete(user.id);
	}
}

// Updates user connection status and sends each client their filtered connected users list
async function sendStatusToAllClients(user, isConnected, status) {

	if (clients.has(user.id)) {
		await getBlockedUsers(user);
		updateConnectedUsers(user, isConnected, status);
		for (const [id, client] of clients) {
			let connectedArray = Array.from(connected.values());
			const blockedSet = blockedIds.get(id) || new Set();
			connectedArray = connectedArray.filter(
				u => !blockedSet.has(Number(u.userId))
			);
			const response = {
				type: "connectedUsers",
				object: connectedArray
			};
			client.send(JSON.stringify(response));
		}
	}
}

// Update the user's status connection
async function setTimer(user) {

	timerId += 1;
	const request = timerId;
	userRequestId.set(user.id, request);
	const timeout = usersTimeout.get(user.id);
	if (timeout) {
		clearTimeout(timeout);
	}
	await sendStatusToAllClients(user, true, "green");
	const yellowTimer = setTimeout(() => {
		if (userRequestId.get(user.id) !== request) {
			return;
		}
		sendStatusToAllClients(user, true, "yellow");
		const redTimer = setTimeout(() => {
			if (userRequestId.get(user.id) !== request) {
				return;
			}
			sendStatusToAllClients(user, true, "red");
		}, 180000);
		usersTimeout.set(user.id, redTimer);
	}, 120000);
	usersTimeout.set(user.id, yellowTimer);
}

// Create a room for private message between two users
async function handlePrivate(user, data) {

	let partner;
	try {
		if (data.id) {
			const partnerId = parseInt(data.id, 10);
			if (user.id !== partnerId) {
				const [a, b] = [user.id, partnerId].sort((x, y) => x - y);
				const roomId = `${a}-${b}`;
				if (!rooms.has(roomId)) {
					rooms.set(roomId, {
						userSocket: clients.get(user.id),
						partnerSocket: clients.get(partnerId)
					})
				}
				partner = await crud.user.getUserById(partnerId);
				await sendJSON(user, partner, null, roomId);
			}
		}
		else {
			const ids = data.roomId.split("-");
			if (parseInt(ids[0], 10) === user.id) {
				partner = await crud.user.getUserById(parseInt(ids[1], 10));
			}
			else {
				partner = await crud.user.getUserById(parseInt(ids[0], 10));
			}
			await sendJSON(user, partner, data.message, data.roomId);
		}
	} catch (error) {
		console.error("Error opening private message:", error);
		return;
	}
}

// Register a user when they connect to the WebSocket server
export async function registerUser(request, socket) {

	const cookies = parse(request.headers.cookie || '');
	const token = cookies.token;
	const user = await extractUserFromToken(token);
	clients.set(user.id, socket);
	usersTimeout.set(user.id, null)
	await setTimer(user);
	return user;
}

// Handle incoming messages from the WebSocket clients and broadcast them to all connected clients
export async function handleIncomingSocketMessage(user, socket) {

	socket.on('message', async message => {
		try {
			const updatedUser = await crud.user.getUserById(user.id);
			const data = JSON.parse(message.toString());
			if (data.type === "message") {
				await sendJSON(updatedUser, null, data.message, null);
			}
			else if (data.type === "status") {
				await setTimer(updatedUser);
			}
			else if (data.type === "private") {
				handlePrivate(updatedUser, data)
			}
		} catch (error) {
			console.log("An error occured:", error);
		}
	})
}

// Handle the closing of the WebSocket connection and update the connected users list
export function handleSocketClose(user, socket) {

	socket.on('close', () => {
		usersTimeout.delete(user.id);
		userRequestId.delete(user.id);
		sendStatusToAllClients(user, false);
		clients.delete(user.id);
		blockedIds.delete(user.id);
	});
}

// Handle errors that occur during the WebSocket connection and update the connected users list
export function handleSocketError(user, socket) {

	socket.on('error', (error) => {
		usersTimeout.delete(user.id);
		userRequestId.delete(user.id);
		sendStatusToAllClients(user, false);
		clients.delete(user.id);
		blockedIds.delete(user.id);
		console.log(`${user.id} WebSocket error :`, error);
	});
}

// Close the connection
export function disconnectUser(user) {

	const socket = clients.get(user.id);
	if (socket) {
		socket.close(1000, "Server closed connection");
		usersTimeout.delete(user.id);
		userRequestId.delete(user.id);
		sendStatusToAllClients(user, false);
		clients.delete(user.id);
		blockedIds.delete(user.id);
	}
}
