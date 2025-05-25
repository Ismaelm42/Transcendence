let htmlUsersConnected = '';
let inputKeyword = '';

async function formatMsgTemplate(data: any, name: string): Promise<string> {

	let htmlContent;
	if (data.username.toString() === name.toString()) {
		htmlContent = await fetch("../../html/chat/msgTemplateUser.html");
	}
	else {
		htmlContent = await fetch("../../html/chat/msgTemplatePartner.html");
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

async function formatConnectedUsersTemplate(data: any, name: string): Promise<string> {

	let htmlText = '';
	let htmlContent;
	let userHtmlContent;
	const usersConnected = Object.values(data.object) as { id: string; username: string; imagePath: string; status: string }[];

	for (const user of usersConnected) {
		userHtmlContent = await fetch("../../html/chat/userListItem.html");
		htmlContent = await userHtmlContent.text();
		htmlContent = htmlContent
			.replace("{{ id }}", user.id.toString())
			.replace("{{ username }}", user.username.toString())
			.replace("{{ usernameImage }}", user.username.toString())
			.replace("{{ imagePath }}", user.imagePath.toString())
			.replace("{{ bgcolor }}", user.status.toString())
			.replace("{{ bcolor }}", user.status.toString())
		htmlText += htmlContent;
	}
	return htmlText;
}

function handleSocketOpen(socket: WebSocket): void {
	socket.onopen = () => {
		const handshake = {
			type: 'handshake',
			message: ''
		};
		socket.send(JSON.stringify(handshake));
	}
}

function sortUsersAlphabetically(htmlContent: string): string {

	const container = document.createElement('div');
	container.innerHTML = htmlContent;
	const items = Array.from(container.querySelectorAll('.item'));

	items.sort((a, b) => {
		const usernameA = a.querySelector('span.text-sm')?.textContent?.trim().toLowerCase() || '';
		const usernameB = b.querySelector('span.text-sm')?.textContent?.trim().toLowerCase() || '';
		return usernameA.localeCompare(usernameB);
	});
	if (items.length > 0) {
		const target = items[0].querySelector('.item-wrapper');
		if (target) {
			target.classList.add("border-t");
		}
	}
	const sortedHtml = items.map(item => item.outerHTML).join('');
	return sortedHtml;
}

function handleSocketMessage(socket: WebSocket, chatMessages: HTMLDivElement, items: HTMLDivElement, name: string): void {
	socket.onmessage = async (event: MessageEvent) => {
		const data = JSON.parse(event.data);
		let HtmlContent = "";
		let stored = "";
		if (data.type === 'message') {
			HtmlContent = await formatMsgTemplate(data, name);
			stored = sessionStorage.getItem("public-chat") || "";
			stored += HtmlContent;
			sessionStorage.setItem("public-chat", stored);
			sessionStorage.setItem("current-room", "");
			chatMessages.innerHTML = stored;
			chatMessages.scrollTop = chatMessages.scrollHeight;
		}
		if (data.type === 'private') {
			console.log(data)
			if (data.message) {
				HtmlContent = await formatMsgTemplate(data, name);
			}
			const privateChat = JSON.parse(sessionStorage.getItem("private-chat") || "{}") as Record<string, string>;
			stored = privateChat[data.roomId] || "";
			stored += HtmlContent || "";
			privateChat[data.roomId] = stored || "";
			sessionStorage.setItem("private-chat", JSON.stringify(privateChat));
			sessionStorage.setItem("current-room", data.roomId);
			chatMessages.innerHTML = stored || "";
			chatMessages.scrollTop = chatMessages.scrollHeight;
		}
		if (data.type === 'connectedUsers') {
			HtmlContent = await formatConnectedUsersTemplate(data, name);
			HtmlContent = sortUsersAlphabetically(HtmlContent);
			htmlUsersConnected = HtmlContent;
			filterSearchUsers(inputKeyword);
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

function retrieveConnectedUsers(socket: WebSocket) {

	const message = {
		type: 'status',
		message: ''
	};
	socket.send(JSON.stringify(message));
}

export function handleSessionStorage(chatMessages: HTMLDivElement, socket: WebSocket | null): WebSocket {

	const currentRoom = sessionStorage.getItem("current-room") || "";
	const publicChat = sessionStorage.getItem("public-chat") || "";
	const privateChat: Record<string, string> = JSON.parse(sessionStorage.getItem("private-chat") || "{}");

	if (!currentRoom && publicChat) {
		chatMessages.innerHTML = publicChat;
	}
	if (currentRoom) {
		chatMessages.innerHTML = privateChat[currentRoom];
	}
	chatMessages.scrollTop = chatMessages.scrollHeight;
	if (!socket || socket.readyState === WebSocket.CLOSED) {
		socket = new WebSocket("https://localhost:8443/back/ws/chat");
	}
	else {
		retrieveConnectedUsers(socket);
	}
	return socket!;
}

export function handleSocket(socket: WebSocket, chatMessages: HTMLDivElement, items:HTMLDivElement , username: string): WebSocket {

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

export function filterSearchUsers(keyword: string): void {
	inputKeyword = keyword;
	const itemsContainer = document.getElementById("user-item-container") as HTMLDivElement;
	const tempContainer = document.createElement("div");
	tempContainer.innerHTML = htmlUsersConnected;
	const userElements = Array.from(tempContainer.querySelectorAll(".item")) as HTMLDivElement[];
	const filteredUsers = userElements.filter(userElement => {
		const username = userElement.querySelector("span.text-sm")?.textContent?.trim().toLowerCase() || "";
		return username.includes(keyword.toLowerCase());
	});
	if (itemsContainer)
	{
		itemsContainer.innerHTML = "";
		if (filteredUsers.length > 0) {
			filteredUsers.forEach(userElement => {
				itemsContainer.appendChild(userElement);
			});
		}
	}
}

export function handlePrivateMsg(e:MouseEvent, items:HTMLDivElement, username:string, socket:WebSocket):void {

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
