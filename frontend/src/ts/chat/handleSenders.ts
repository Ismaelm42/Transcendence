import { removeNotificationAndUpdateHTML } from "./loadAndUpdateDOM.js";

export async function getUserId(username: string): Promise<string> {

	const id = await fetch("https://localhost:8443/back/getIdByUsername", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			username: username
		}),
	});
	if (!id.ok) {
		throw new Error("Failed to fetch user ID");
	}
	return id.text();
}

export function retrieveConnectedUsers(socket: WebSocket) {

	const message = {
		type: 'status',
		message: ''
	};
	socket.send(JSON.stringify(message));
}

export function handleFormSubmit(e: SubmitEvent, textarea: HTMLTextAreaElement, socket: WebSocket) {
	
	e.preventDefault();
	let message = {};
	const currentRoom = sessionStorage.getItem("current-room") || "";
	const msg = textarea.value.trim();
	
	if (msg) {
		if (!currentRoom) {
			message = {
				type: 'message',
				message: msg,
			};
		}
		else {
			message = {
				type: 'private',
				roomId: currentRoom,
				message: msg,
			}
		}
		socket.send(JSON.stringify(message));
		textarea.value = '';
	}
}

export function handlePrivateMsg(e: MouseEvent, socket: WebSocket) {

	const target = e.target as HTMLElement;
	const userDiv = target.closest('[data-id]') as HTMLElement | null;
	if (!userDiv)
		return;
	const id = userDiv.dataset.id;
	const message = {
		type: 'private',
		id: id,
	};
	socket.send(JSON.stringify(message));
}

export function showPrivateChat(e: MouseEvent, socket: WebSocket, userId: string) {
	const target = e.target as HTMLElement;
	const chatDiv = target.closest('[id^="chat-item-"]') as HTMLElement | null;
	if (!chatDiv)
		return;
	const currentRoom = sessionStorage.getItem("current-room") || "";
	const roomId = (chatDiv.id).replace("chat-item-", "");
	removeNotificationAndUpdateHTML(roomId);
	if (currentRoom !== roomId) {
		const [id1, id2] = roomId.split("-");
		const id = id1 === userId ? id2 : id1;
		console.log("id", id)
		const message = {
			type: 'private',
			id: id,
		};
		socket.send(JSON.stringify(message));
	}
}
