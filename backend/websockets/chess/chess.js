import { parse } from 'cookie';
import { crud } from '../../crud/crud.js'
import { Chessboard } from './chessboardClass.js'
import { extractUserFromToken } from '../../auth/token.js';

const clients = new Map(); //Number-socket
const lobby = new Map(); //Number-data(config)
const chessboard = new Map(); //Number-data(board)

export async function registerUser(request, socket) {

	const cookies = parse(request.headers.cookie || '');
	const token = cookies.token;
	const user = await extractUserFromToken(token);
	clients.set(user.id, socket);
	return user;
}

function sendMsgToClient(id, message) {

	const socket = clients.get(id);
	if (socket)
		socket.send(JSON.stringify(message))
}

function sendMsgToAll(message) {

	for (const [id, client] of clients)
		client.send(JSON.stringify(message));
}

function formatTime(time) {

	const totalSeconds = Math.floor(time / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;

	const formattedMinutes = minutes.toString().padStart(2, '0');
	const formattedSeconds = seconds.toString().padStart(2, '0');

	return `${formattedMinutes}:${formattedSeconds}`;
}

function sendInfoToClient(user, data) {

	let message;

	if (chessboard.has(user.id)) {
		const board = chessboard.get(user.id);
		const isHost = (user.id === board.hostId) ? true : false;
		message = {
			type: 'info',
			inGame: true,
			playerName: isHost ? board.hostName : board.guestName,
			opponentName: isHost ? board.guestName : board.hostName,
			playerElo: isHost ? board.hostElo.toString() : board.guestElo.toString(),
			opponentElo: isHost ? board.guestElo.toString() : board.hostElo.toString(),
			playerImagePath: isHost ? board.hostImagePath : board.guestImagePath,
			opponentImagePath: isHost ? board.guestImagePath : board.hostImagePath,
			playerTime: isHost ? formatTime(board.hostTime) : formatTime(board.guestTime),
			opponentTime: isHost ? formatTime(board.guestTime) : formatTime(board.hostTime),
			playerColorView: isHost ? board.hostColorView : board.guestColorView,
			lastMoveFrom: board.lastMoveFrom === null ? null : board.lastMoveFrom.toString(),
			lastMoveTo: board.lastMoveTo === null ? null : board.lastMoveTo.toString(),
			board: board.getBoard(),
		}
	}
	else {
		message = {
			type: 'info',
			inGame: false,
		}
	}
	sendMsgToClient(user.id, message);
}

function sendLobbyToAllClients() {

	const lobbyArray = Array.from(lobby.values());
	const message = {
		type: 'lobby',
		object: lobbyArray
	}
	sendMsgToAll(message);
}

function createLobby(user, data) {

	const newLobby = {
		userId: user.id,
		username: user.username,
		rating: "1200",
		playerColor: data.playerColor,
		timeControl: data.timeControl,
		gameMode: 'online',
	}
	lobby.set(user.id, newLobby);
	sendLobbyToAllClients();
}

function deleteLobby(id) {

	if (lobby.has(id)) {
		lobby.delete(id);
		sendLobbyToAllClients();
	}
}

async function createBoard(user, data) {

	let board;
	let config;
	const hostColor = (data.playerColor === "random") ? (Math.random() < 0.5 ? "white" : "black") : data.playerColor;
	const host = await crud.user.getUserById(Number(data.userId));

	if (data.gameMode === 'local') {
		config = {
			hostId: user.id,
			guestId: user.id,
			hostName: user.username,
			guestName: "Guest",
			hostElo: "2000",
			guestElo: "N/A",
			hostImagePath: user.avatarPath,
			guestImagePath: user.avatarPath,
			hostColor: hostColor,
			guestColorView: hostColor,
			gameMode: data.gameMode,
			timeControl: data.timeControl,
		}
	}
	else {
		config = {
			hostId: host.id,
			guestId: user.id,
			hostName: host.username,
			guestName: user.username,
			hostElo: "2000",
			guestElo: "2500",
			hostImagePath: host.avatarPath,
			guestImagePath: user.avatarPath,
			hostColor: hostColor,
			gameMode: data.gameMode,
			timeControl: data.timeControl,
		}
	}
	board = new Chessboard(config);
	return board;
}

async function createOnlineGame(user, data) {

	const config = lobby.get(Number(data.id));
	const board = await createBoard(user, config);

	chessboard.set(user.id, board);
	chessboard.set(Number(data.id), board);
	deleteLobby(Number(data.id));

	const hostMessage = {
		type: 'info',
		inGame: true,
		playerName: board.hostName,
		opponentName: board.guestName,
		playerElo: board.hostElo,
		opponentElo: board.guestElo,
		playerImagePath: board.hostImagePath,
		opponentImagePath: board.guestImagePath,
		playerTime: formatTime(board.hostTime),
		opponentTime: formatTime(board.guestTime),
		playerColorView: board.hostColorView,
		lastMoveFrom: board.lastMoveFrom === null ? null : board.lastMoveFrom.toString(),
		lastMoveTo: board.lastMoveTo === null ? null : board.lastMoveTo.toString(),
		board: board.getBoard(),
	}
	sendMsgToClient(Number(data.id), hostMessage);

	const guestMessage = {
		type: 'info',
		inGame: true,
		playerName: board.guestName,
		opponentName: board.hostName,
		playerElo: board.guestElo,
		opponentElo: board.hostElo,
		playerImagePath: board.guestImagePath,
		opponentImagePath: board.hostImagePath,
		playerTime: formatTime(board.guestTime),
		opponentTime: formatTime(board.hostTime),
		playerColorView: board.guestColorView,
		lastMoveFrom: board.lastMoveFrom === null ? null : board.lastMoveFrom.toString(),
		lastMoveTo: board.lastMoveTo === null ? null : board.lastMoveTo.toString(),
		board: board.getBoard(),
	}
	sendMsgToClient(user.id, guestMessage);
	sendTime(board);
}

async function createLocalGame(user, data) {

	const board = await createBoard(user, data);
	chessboard.set(user.id, board);

	const message = {
		type: 'info',
		inGame: true,
		playerName: board.hostName,
		opponentName: board.guestName,
		playerElo: board.hostElo.toString(),
		opponentElo: board.guestElo.toString(),
		playerImagePath: board.hostImagePath,
		opponentImagePath: board.guestImagePath,
		playerTime: formatTime(board.hostTime),
		opponentTime: formatTime(board.guestTime),
		playerColorView: board.hostColorView,
		lastMoveFrom: board.lastMoveFrom === null ? null : board.lastMoveFrom.toString(),
		lastMoveTo: board.lastMoveTo === null ? null : board.lastMoveTo.toString(),
		board: board.getBoard(),
	}
	sendMsgToClient(user.id, message);
	sendTime(board);
}

function sendTime(board) {

	board.intervalId = setInterval(() => {

		if (board.gameOver) {
			clearInterval(board.intervalId);
			return;
		}

		sendMsgToClient(board.hostId, {
			type: "time",
			playerTime: formatTime(board.hostTime),
			opponentTime: formatTime(board.guestTime),
		});

		if (board.gameMode === 'online') {
			sendMsgToClient(board.guestId, {
				type: "time",
				playerTime: formatTime(board.guestTime),
				opponentTime: formatTime(board.hostTime),
			});
		}
	}, 200);
}

function movePiece(user, data) {

	let message;

	if (chessboard.has(user.id)) {
		const board = chessboard.get(user.id);
		message = board.handleMove(data, user.id);
		if (message.type === 'promote')
			sendMsgToClient(user.id, { ...message, playerColorView: user.id === board.hostId ? board.hostColorView : board.guestColorView });
		else {
			sendMsgToClient(board.hostId, { ...message, playerColorView: board.hostColorView, });
			if (board.gameMode === 'online')
				sendMsgToClient(board.guestId, { ...message, playerColorView: board.guestColorView, });
		}
	}
}

export function handleIncomingSocketMessage(user, socket) {

	socket.on('message', async message => {
		try {
			const data = JSON.parse(message.toString());

			switch (data.type) {
				case 'info':
					sendInfoToClient(user, data);
					break;
				case 'lobby':
					sendLobbyToAllClients();
					break;
				case 'config':
					if (data.gameMode === 'online')
						createLobby(user, data);
					else {
						deleteLobby(user.id);
						createLocalGame(user, data);
					}
					break;
				case 'join':
					createOnlineGame(user, data);
					break;
				case 'cancel':
					deleteLobby(user.id);
					break;
				case 'move':
					movePiece(user, data);
					break;
			}
		} catch (error) {
			console.log("An error occured:", error);
		}
	})
}

export function handleSocketClose(user, socket) {

	socket.on('close', () => {
		deleteLobby(user.id);
		clients.delete(user.id);
		const board = chessboard.get(user.id);
		if (board)
			clearInterval(board.intervalId);
		chessboard.delete(user.id);
	});
}

export function handleSocketError(user, socket) {

	socket.on('error', (error) => {
		console.log(`WebSocket error :`, error);
	});
}
