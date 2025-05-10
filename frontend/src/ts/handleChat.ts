import { SPA } from './spa.js';
import { showMessage } from './showMessage.js';

async function formatMsgTemplate(data: any, name: string): Promise<string> {

	let htmlContent;
	if (data.username.toString() === name.toString()) {
		htmlContent = await fetch("../html/msgTemplateUser.html");
	}
	else {
		htmlContent = await fetch("../html/msgTemplatePartner.html");
	}
	let htmlText = await htmlContent.text();
	htmlText = htmlText
	.replace("{{ username }}", data.username.toString())
	.replace("{{ timeStamp }}", data.timeStamp.toString())
	.replace("{{ message }}", data.message.toString())
	.replace("{{ imagePath }}", data.imagePath.toString())
	.replace("{{ usernameImage }}", data.username.toString());
	return htmlText;
}

async function formatConnectedUsersTemplate(data: any, name:string): Promise<string> {

	let htmlText = '';
	let htmlContent;
	let userHtmlContent;
	const usersConnected = Object.values(data.object) as { username: string; imagePath: string }[];

	console.log("ESTOYT AQUI");
	console.log(usersConnected)
	for (const user of usersConnected) {
		// if (user.username.toString() !== name.toString()) {
			userHtmlContent = await fetch("../html/userListItem.html");
			htmlContent = await userHtmlContent.text();
			htmlContent = htmlContent
			.replace("{{ username }}", user.username.toString())
			.replace("{{ usernameImage }}", user.username.toString())
			.replace("{{ imagePath }}", user.imagePath.toString())
			htmlText += htmlContent;
		// }
	}
	return htmlText;
}

function handleSocketOpen(socket: WebSocket): void {
	socket.onopen = () => {
		const handshake = {
			type: 'handshake',
			message: 'hi'
		};
		socket.send(JSON.stringify(handshake));
	}
}

function handleSocketMessage(socket: WebSocket, chatMessages: HTMLDivElement, items: HTMLDivElement, name: string): void {
	socket.onmessage = async (event: MessageEvent) => {
		const data = JSON.parse(event.data);
		if (data.type === 'message') {
			const HtmlContent = await formatMsgTemplate(data, name);
			chatMessages.insertAdjacentHTML('beforeend', HtmlContent);
			chatMessages.scrollTop = chatMessages.scrollHeight;
		}
		if (data.type === 'connectedUsers') {
			const HtmlContent = await formatConnectedUsersTemplate(data, name);
			items.innerHTML = HtmlContent;
		}
	}
}

// TODO: Handle the case when the Socket close.
function handleSocketClose(socket: WebSocket): void {
	socket.onclose = (event: CloseEvent) => {
		console.log(`CLIENT: Connection closed - Code: ${event.code}`);
	}
}

// TODO: Handle the case when the Socket gets an error.
function handleSocketError(socket: WebSocket): void {
	socket.onerror = (event) => {
		console.error("CLIENT: WebSocket error:", event);
	}
}

export function handleSocket(chatMessages: HTMLDivElement, items:HTMLDivElement , username: string): WebSocket {
	const socket = new WebSocket("https://localhost:8443/back/ws/chat");
	handleSocketOpen(socket);
	handleSocketMessage(socket, chatMessages, items, username);
	handleSocketClose(socket);
	handleSocketError(socket);
	return socket;
}

export function handleTextareaKeydown(e: KeyboardEvent, form: HTMLFormElement) {
	if (e.key === 'Enter' && !e.shiftKey) {
		e.preventDefault();
		form.requestSubmit();
	}
}

export function handleFormSubmit(e: SubmitEvent, textarea: HTMLTextAreaElement, socket: WebSocket) {
	e.preventDefault();
	const chatMsg = textarea.value.trim();
	if (chatMsg) {
		const message = {
			type: 'message',
			message: chatMsg,
		};
		socket.send(JSON.stringify(message));
		textarea.value = '';
	}
}
