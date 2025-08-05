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
	const tenths = Math.floor((time % 1000) / 100);

	const formattedMinutes = minutes.toString().padStart(2, '0');
	const formattedSeconds = seconds.toString().padStart(2, '0');

	if (time < 20000) {
		return `${formattedMinutes}:${formattedSeconds}.${tenths}`;
	} else {
		return `${formattedMinutes}:${formattedSeconds}`;
	}
}

function sendInfoToClient(user) {

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
		playerColor: data.playerColor,
		timeControl: data.timeControl,
		gameMode: 'online',
		minRating: 'any',
		maxRating: 'any',
		rating: '4000',
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
	const hostColor = (data.playerColor === 'random') ? (Math.random() < 0.5 ? 'white' : 'black') : data.playerColor;
	const host = await crud.user.getUserById(Number(data.userId));

	if (data.gameMode === 'local') {
		config = {
			hostId: user.id,
			guestId: user.id,
			hostName: user.username,
			guestName: 'Guest',
			hostElo: '2000',
			guestElo: 'N/A',
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
			hostElo: '2000',
			guestElo: '2500',
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

async function createOnlineGame(user, opponentId) {

	const config = lobby.get(Number(opponentId));
	const board = await createBoard(user, config);

	chessboard.set(user.id, board);
	chessboard.set(Number(opponentId), board);
	deleteLobby(user.id);
	deleteLobby(Number(opponentId));

	const hostMessage = {
		type: 'info',
		inGame: true,
		isNewGame: true,
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
	sendMsgToClient(Number(opponentId), hostMessage);

	const guestMessage = {
		type: 'info',
		inGame: true,
		isNewGame: true,
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
	updateTimePlayers(board);
}

async function createLocalGame(user, data) {

	const board = await createBoard(user, data);
	chessboard.set(user.id, board);

	const message = {
		type: 'info',
		inGame: true,
		isNewGame: true,
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
	updateTimePlayers(board);
}

function updateTimePlayers(board) {

	board.intervalId = setInterval(() => {

		if (board.mateType) {
			clearInterval(board.intervalId);
			return;
		}

		if (board.timeOut) {
			clearInterval(board.intervalId);
			sendMsgToClient(board.hostId, {
				type: 'timeout',
				loser: board.timeOut,
				winner: board.timeOut === board.hostName ? board.guestName : board.hostName,
			});
			if (board.gameMode === 'online') {
				sendMsgToClient(board.guestId, {
					type: 'timeout',
					loser: board.timeOut,
					winner: board.timeOut === board.hostName ? board.guestName : board.hostName,
				});
			}
			return;
		}

		sendMsgToClient(board.hostId, {
			type: 'time',
			playerTime: formatTime(board.hostTime),
			opponentTime: formatTime(board.guestTime),
		});

		if (board.gameMode === 'online') {
			sendMsgToClient(board.guestId, {
				type: 'time',
				playerTime: formatTime(board.guestTime),
				opponentTime: formatTime(board.hostTime),
			});
		}
	}, 100);
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

function deleteGame(id) {

	const board = chessboard.get(id);
	if (board)
		clearInterval(board.intervalId);
	chessboard.delete(id);
}

function isOpponentAvailable(user) {

	const board = chessboard.get(user.id);
	const opponentId = user.id === board.hostId ? board.guestId : board.hostId;
	const opponentBoard = chessboard.get(opponentId);
	if (!clients.has(opponentId)) {
		const message = {
			type: 'cancelRematch',
			opponentName: opponentId === board.hostId ? board.hostName : board.guestName,
			reason: 'is not connected',
		}
		sendMsgToClient(user.id, message);
		return false;
	}
	else if (user.id !== opponentBoard.hostId && user.id !== opponentBoard.guestId) {
		const message = {
			type: 'cancelRematch',
			opponentName: opponentId === board.hostId ? board.hostName : board.guestName,
			reason: 'is in game',
		}
		sendMsgToClient(user.id, message);
		return false;
	}
	return true;
}

function isLocalRematch(user) {

	const board = chessboard.get(user.id);
	if (board.gameMode === 'local') {
		const data = {
			type: 'config',
			userId: user.id,
			playerColor: user.id === board.hostId ? board.guestColor : board.hostColor,
			timeControl: board.timeControl,
			gameMode: 'local',
			minRating: 'any',
			maxRating: 'any',
		}
		deleteGame(user.id);
		createLocalGame(user, data);
		return true;
	}
	return false;
}
























// FLAG to create the game instead of requesting a rematch
function requestRematch(user) {

	if (!isLocalRematch(user) && isOpponentAvailable(user)) {

		const message = {
			type: 'requestRematch',
			username: user.username,
		}
		const board = chessboard.get(user.id);
		const opponentId = user.id === board.hostId ? board.guestId : board.hostId;
		sendMsgToClient(opponentId, message);
	}
}

async function acceptRematch(user) {

	if (isOpponentAvailable(user)) {
		const board = chessboard.get(user.id);
		const opponentId = user.id === board.hostId ? board.guestId : board.hostId;
		const opponent = await crud.user.getUserById(opponentId);

		const newLobby = {
			userId: opponent.id,
			username: opponent.username,
			playerColor: opponent.id === board.hostId ? board.guestColor : board.hostColor,
			timeControl: board.timeControl,
			gameMode: 'online',
			minRating: 'any',
			maxRating: 'any',
		}
		console.log(newLobby);
		lobby.set(opponent.id, newLobby);
		deleteGame(user.id);
		deleteGame(opponent.id);
		createOnlineGame(user, opponent.id);
	}
}

function rejectRematch(user) {

	const board = chessboard.get(user.id);
	const opponentId = user.id === board.hostId ? board.guestId : board.hostId;

	const message = {
		type: 'cancelRematch',
		opponentName: user.username,
		reason: 'declined the rematch',
	}
	sendMsgToClient(opponentId, message);
}

export function handleIncomingSocketMessage(user, socket) {

	socket.on('message', async message => {
		try {
			const data = JSON.parse(message.toString());
			console.log("Received message:", data);
			switch (data.type) {
				case 'info':
					sendInfoToClient(user);
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
					createOnlineGame(user, data.id);
					break;
				case 'deleteLobby':
					deleteLobby(user.id);
					break;
				case 'move':
					movePiece(user, data);
					break;
				case 'delete':
					deleteGame(user.id);
					break;
				case 'requestRematch':
					requestRematch(user);
					break;
				case 'rematch':
					acceptRematch(user);
					break;
				case 'rejectRematch':
					rejectRematch(user);
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
		deleteGame(user.id)
	});
}

export function handleSocketError(user, socket) {

	socket.on('error', (error) => {
		console.log(`WebSocket error :`, error);
	});
}
