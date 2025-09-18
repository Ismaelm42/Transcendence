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
	const board = chessboard.get(user.id);
	if (board && !board.gameState)
		chessboard.delete(user.id);
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

async function updateChessRatings(user, message) {

	console.log(user.id);
	const board = chessboard.get(user.id);
	let diff = 0;

	if (board && board.gameMode === 'online') {
		if (message.winner && user.id === message.winnerId) {
			diff = await crud.user.calculateElo(message.winnerId, message.loserId, 1);
			board.hostId === message.winnerId ? board.hostElo += diff : board.guestElo += diff;
			board.hostId === message.loserId ?  board.hostElo -= diff : board.guestElo -= diff;
		}
		else if (message.type === 'stalemate' || message.type === 'agreement') {
			diff = await crud.user.calculateElo(message.hostId, message.guestId, 0);
			board.hostId < board.guestId ? board.hostElo += diff : board.hostElo -= diff;
			board.guestId < board.hostId ? board.guestElo += diff : board.guestElo -= diff;
		}
		else if (message.type === 'timeout') {
			diff = await crud.user.calculateElo(message.winnerId, message.loserId, 1);
			board.hostId === message.winnerId ? board.hostElo += diff : board.guestElo += diff;
			board.hostId === message.loserId ?  board.hostElo -= diff : board.guestElo -= diff;
		}
	}
}


function sendInfoToClient(user) {

	let message;

	if (chessboard.has(user.id)) {
		const board = chessboard.get(user.id);
		const isHost = user.id === board.hostId ? true : false;
		const isDownSide = isHost ? (board.hostColorView === board.hostColor ? true : false) : (board.guestColorView === board.guestColor ? true : false)

	message = {
			type: 'info',
			inGame: true,
			playerName: isDownSide ? (user.id === board.hostId ? board.hostName : board.guestName) : (user.id === board.hostId ? board.guestName : board.hostName),
			opponentName: isDownSide ? (user.id === board.hostId ? board.guestName : board.hostName) : (user.id === board.hostId ? board.hostName : board.guestName),
			playerElo: isDownSide ? (user.id === board.hostId ? board.hostElo.toString() : board.guestElo.toString()) : (user.id === board.hostId ? board.guestElo.toString() : board.hostElo.toString()),
			opponentElo: isDownSide ? (user.id === board.hostId ? board.guestElo.toString() : board.hostElo.toString()) : (user.id === board.hostId ? board.hostElo.toString() : board.guestElo.toString()),
			playerImagePath: isDownSide ? (user.id === board.hostId ? board.hostImagePath : board.guestImagePath) : (user.id === board.hostId ? board.guestImagePath : board.hostImagePath),
			opponentImagePath: isDownSide ? (user.id === board.hostId ? board.guestImagePath : board.hostImagePath) : (user.id === board.hostId ? board.hostImagePath : board.guestImagePath),
			playerTime: isDownSide ? (user.id === board.hostId ? formatTime(board.hostTime) : formatTime(board.guestTime)) : (user.id === board.hostId ? formatTime(board.guestTime) : formatTime(board.hostTime)),
			opponentTime: isDownSide ? (user.id === board.hostId ? formatTime(board.guestTime) : formatTime(board.hostTime)) : (user.id === board.hostId ? formatTime(board.hostTime) : formatTime(board.guestTime)),
			playerColorView: user.id === board.hostId ? board.hostColorView : board.guestColorView,
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
		minRating: data.minRating,
		maxRating: data.maxRating,
		rating: user.chessRating,
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
			hostElo: user.chessRating,
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
			hostElo: host.chessRating,
			guestElo: user.chessRating,
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
	updateTimePlayers(user, board);
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
	updateTimePlayers(user, board);
}

function updateTimePlayers(user, board) {

	board.intervalId = setInterval(async () => {

		if (board.mateType) {
			clearInterval(board.intervalId);
			return;
		}
		if (board.timeOut) {
			clearInterval(board.intervalId);
			const winnerId = board.timeOut === board.hostName ? board.guestId : board.hostId;
			const loserId = board.timeOut === board.hostName ? board.hostId : board.guestId;
			const message = {
				type: 'timeout',
				winner: board.timeOut === board.hostName ? board.guestName : board.hostName,
				winnerId: winnerId,
				loser: board.timeOut,
				loserId: loserId,
			}
			sendMsgToClient(board.hostId, message);
			if (board.gameMode === 'online')
				sendMsgToClient(board.guestId, message);

			await updateChessRatings(user, message, 1);
			return;
		}

		sendMsgToClient(board.hostId, {
			type: 'time',
			playerTime: board.hostColorView === board.hostColor ? formatTime(board.hostTime) : formatTime(board.guestTime),
			opponentTime: board.hostColorView === board.hostColor ? formatTime(board.guestTime) : formatTime(board.hostTime),
		});

		if (board.gameMode === 'online') {
			sendMsgToClient(board.guestId, {
				type: 'time',
				playerTime: board.guestColorView === board.guestColor ? formatTime(board.guestTime) : formatTime(board.hostTime),
				opponentTime: board.guestColorView === board.guestColor ? formatTime(board.hostTime) : formatTime(board.guestTime),
			});
		}
	}, 100);
}

async function movePiece(user, data) {

	let message;

	if (chessboard.has(user.id)) {
		const board = chessboard.get(user.id);
		message = board.handleMove(data, user.id);
		await updateChessRatings(user, message);
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
			rating: user.chessRating,
		}
		deleteGame(user.id);
		createLocalGame(user, data);
		return true;
	}
	return false;
}

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
			rating: user.chessRating,
		}
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

function handleNavigation(user, data) {

	const board = chessboard.get(user.id);
	let moveEnabled;
	
	if (data.step === 'first')
		moveEnabled = board.firstReplayMove();
	else if (data.step === 'previous')
		moveEnabled = board.previousReplayMove();
	else if (data.step === 'next')
		moveEnabled = board.nextReplayMove();
	else if (data.step === 'last')
		moveEnabled = board.lastReplayMove();

	const replayBoard = board.getReplayBoard();
	const lastMoveFrom = board.allMovesFrom.get(board.currentBoardMove);
	const lastMoveTo = board.allMovesTo.get(board.currentBoardMove);
	
	const message = {
		type: 'navigate',
		currentMove: Math.round(board.currentBoardMove / 2),
		moveEnabled: moveEnabled,
		playerColorView: user.id === board.hostId ? board.hostColorView : board.guestColorView,
		lastMoveFrom: lastMoveFrom === null ? null : lastMoveFrom.toString().padStart(2, "0"),
		lastMoveTo: lastMoveTo === null ? null : lastMoveTo.toString().padStart(2, "0"),
		board: replayBoard,
	}
	sendMsgToClient(user.id, message);
}

function flipBoard(user) {

	const board = chessboard.get(user.id);

	if (user.id === board.hostId)
		board.hostColorView = board.hostColorView === 'white' ? 'black' : 'white';
	else
		board.guestColorView = board.guestColorView === 'white' ? 'black' : 'white';

	const isHost = user.id === board.hostId ? true : false;
	const isDownSide = isHost ? (board.hostColorView === board.hostColor ? true : false) : (board.guestColorView === board.guestColor ? true : false)

	const message = {
			type: 'flip',
			playerName: isDownSide ? (user.id === board.hostId ? board.hostName : board.guestName) : (user.id === board.hostId ? board.guestName : board.hostName),
			opponentName: isDownSide ? (user.id === board.hostId ? board.guestName : board.hostName) : (user.id === board.hostId ? board.hostName : board.guestName),
			playerElo: isDownSide ? (user.id === board.hostId ? board.hostElo.toString() : board.guestElo.toString()) : (user.id === board.hostId ? board.guestElo.toString() : board.hostElo.toString()),
			opponentElo: isDownSide ? (user.id === board.hostId ? board.guestElo.toString() : board.hostElo.toString()) : (user.id === board.hostId ? board.hostElo.toString() : board.guestElo.toString()),
			playerImagePath: isDownSide ? (user.id === board.hostId ? board.hostImagePath : board.guestImagePath) : (user.id === board.hostId ? board.guestImagePath : board.hostImagePath),
			opponentImagePath: isDownSide ? (user.id === board.hostId ? board.guestImagePath : board.hostImagePath) : (user.id === board.hostId ? board.hostImagePath : board.guestImagePath),
			playerTime: isDownSide ? (user.id === board.hostId ? formatTime(board.hostTime) : formatTime(board.guestTime)) : (user.id === board.hostId ? formatTime(board.guestTime) : formatTime(board.hostTime)),
			opponentTime: isDownSide ? (user.id === board.hostId ? formatTime(board.guestTime) : formatTime(board.hostTime)) : (user.id === board.hostId ? formatTime(board.hostTime) : formatTime(board.guestTime)),
			playerColorView: user.id === board.hostId ? board.hostColorView : board.guestColorView,
			lastMoveFrom: board.lastMoveFrom === null ? null : board.lastMoveFrom.toString(),
			lastMoveTo: board.lastMoveTo === null ? null : board.lastMoveTo.toString(),
			board: board.getBoard(),
		}
	sendMsgToClient(user.id, message);
}

function requestDraw(user) {
	
	const board = chessboard.get(user.id);
	const opponentId = user.id === board.hostId ? board.guestId : board.hostId;
	
	if (board.gameMode === 'online') {
		const message = {
			type: 'requestDraw',
			username: user.username,
		}
		sendMsgToClient(opponentId, message);
	}
	else
		acceptDraw(user);
}

async function acceptDraw(user) {

	const board = chessboard.get(user.id);
	const opponentId = user.id === board.hostId ? board.guestId : board.hostId;

	board.updateTime('agreement');
	const message = board.buildClientMessage('agreement', board.lastMoveFrom, board.lastMoveTo, null, user.id);

	await updateChessRatings(user, message);

	if (board.gameMode !== 'local')
		sendMsgToClient(opponentId, message);
	sendMsgToClient(user.id, message);
}

async function resign(user) {

	const board = chessboard.get(user.id);
	const opponentId = user.id === board.hostId ? board.guestId : board.hostId;

	board.updateTime('resignation');
	const message = board.buildClientMessage('resignation', board.lastMoveFrom, board.lastMoveTo, null, user.id);

	await updateChessRatings(user, message);

	if (board.gameMode !== 'local')
		sendMsgToClient(opponentId, message);
	sendMsgToClient(user.id, message);
}


export function handleIncomingSocketMessage(user, socket) {

	socket.on('message', async message => {
		try {
			const data = JSON.parse(message.toString());
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
				case 'navigate':
					handleNavigation(user, data);
					break;
				case 'flip':
					flipBoard(user);
					break;
				case 'cancel':
					cancelGame(user);
					break;
				case 'requestDraw':
					requestDraw(user);
					break;
				case 'acceptDraw':
					acceptDraw(user);
					break;
				case 'resign':
					resign(user);
					break;
			}
		} catch (error) {
			console.log("An error occured:", error);
		}
	})
}

export function handleSocketClose(user, socket) {

	socket.on('close', () => {
		console.log("SOCKET CLOSED")
		deleteLobby(user.id);
		clients.delete(user.id);
	});
}

export function handleSocketError(user, socket) {

	socket.on('error', (error) => {
		console.log("SOCKET ERROR")
		deleteLobby(user.id);
		clients.delete(user.id);
		console.log(`WebSocket error :`, error);
	});
}



// Problemas:

// Cuando un usuario gana o pierde no se actualiza la puntuación
// Las puntuaciones a veces hacen cosillas raras. No sé muy bien qué ocurre. Echarle un ojo
// Las puntuaciones para las partidas locales están deshabilitadas.
// El filtro de elo no está implementado. Habría que hacerlo.
// Es muy posible que sea por el no uso de await crud.user.getUserById en funciones como rematch.
