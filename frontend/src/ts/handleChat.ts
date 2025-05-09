import { SPA } from './spa.js';
import { showMessage } from './showMessage.js';

async function formatMsgTemplate(data: any, name: string): Promise<string> {

	let HtmlContent;
	if (data.username.toString() === name.toString()) {
		HtmlContent = await fetch("../html/msgTemplateUser.html");
	}
	else {
		HtmlContent = await fetch("../html/msgTemplatePartner.html");
	}
	let htmlText = await HtmlContent.text();
	htmlText = htmlText
	.replace("{{ username }}", data.username.toString())
	.replace("{{ timeStamp }}", data.timeStamp.toString())
	.replace("{{ message }}", data.message.toString())
	.replace("{{ messageStatus }}", data.messageStatus.toString())
	.replace("{{ imagePath }}", data.imagePath.toString())
	.replace("{{ usernameImage }}", data.username.toString());
	console.log(htmlText);
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

function handleSocketMessage(socket: WebSocket, chatMessages: HTMLDivElement, name: string): void {
	socket.onmessage = async (event: MessageEvent) => {
		const data = JSON.parse(event.data);
		if (data.type === 'message') {
			const HtmlContent = await formatMsgTemplate(data, name);
			chatMessages.insertAdjacentHTML('beforeend', HtmlContent);
			chatMessages.scrollTop = chatMessages.scrollHeight;
		}
	}
}

function handleSocketClose(socket: WebSocket): void {
	socket.onclose = (event: CloseEvent) => {
		console.log(`CLIENT: Connection closed - Code: ${event.code}`);
	}
}

function handleSocketError(socket: WebSocket): void {
	socket.onerror = (event) => {
		console.error("CLIENT: WebSocket error:", event);
	}
}

export function handleSocket(chatMessages: HTMLDivElement, username: string): WebSocket {
	const socket = new WebSocket("https://localhost:8443/back/ws/chat");
	handleSocketOpen(socket);
	handleSocketMessage(socket, chatMessages, username);
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
	const message = textarea.value.trim();
	if (message) {
		socket.send(message);
		textarea.value = '';
	}
}
