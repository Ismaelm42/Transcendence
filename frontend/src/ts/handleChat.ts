let htmlUsersConnected = '';

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

async function formatConnectedUsersTemplate(data: any, name: string): Promise<string> {

	let htmlText = '';
	let htmlContent;
	let userHtmlContent;
	const usersConnected = Object.values(data.object) as { username: string; imagePath: string; status: string }[];

	for (const user of usersConnected) {
		userHtmlContent = await fetch("../html/userListItem.html");
		htmlContent = await userHtmlContent.text();
		htmlContent = htmlContent
			.replace("{{ username }}", user.username.toString())
			.replace("{{ usernameImage }}", user.username.toString())
			.replace("{{ imagePath }}", user.imagePath.toString())
			.replace("{{ bgcolor }}", user.status.toString())
			.replace("{{ bcolor }}", user.status.toString());
		htmlText += htmlContent;
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

function sortUsersAlphabetically(htmlContent: string): string {

	const container = document.createElement('div');
	container.innerHTML = htmlContent;
	const items = Array.from(container.querySelectorAll('.item'));

	items.sort((a, b) => {
		const usernameA = a.querySelector('span.text-sm')?.textContent?.trim().toLowerCase() || '';
		const usernameB = b.querySelector('span.text-sm')?.textContent?.trim().toLowerCase() || '';
		return usernameA.localeCompare(usernameB);
	});
	const sortedHtml = items.map(item => item.outerHTML).join('');
	return sortedHtml;
}

function handleSocketMessage(socket: WebSocket, chatMessages: HTMLDivElement, items: HTMLDivElement, name: string): void {
	socket.onmessage = async (event: MessageEvent) => {
		const data = JSON.parse(event.data);
		if (data.type === 'message') {
			const HtmlContent = await formatMsgTemplate(data, name);
			let stored = sessionStorage.getItem("chatHTML") || "";
			stored += HtmlContent;
			sessionStorage.setItem("chatHTML", stored);
			chatMessages.innerHTML = stored;
			chatMessages.scrollTop = chatMessages.scrollHeight;
		}
		if (data.type === 'connectedUsers') {
			let HtmlContent = await formatConnectedUsersTemplate(data, name);
			HtmlContent = sortUsersAlphabetically(HtmlContent);
			htmlUsersConnected = HtmlContent;
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

export function handleSocket(chatMessages: HTMLDivElement, items: HTMLDivElement, username: string): WebSocket {
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

/**
 * Take the keyword from the search input and filter the list of connected users.
 * @param keyword - The keyword to search for in the list of connected users.
 * @returns 
 */
export function filterSearchUsers(keyword: string): void {

	// Obtener el contenedor de usuarios conectados
	const itemsContainer = document.getElementById("item-container") as HTMLDivElement;
	if (!itemsContainer) {
		console.error("Items container not found");
		return;
	}

	// Crear un contenedor temporal para procesar htmlUsersConnected
	const tempContainer = document.createElement("div");
	tempContainer.innerHTML = htmlUsersConnected;

	// Obtener todos los elementos de usuario conectados desde htmlUsersConnected
	const userElements = Array.from(tempContainer.querySelectorAll(".item")) as HTMLDivElement[];

	// Filtrar los usuarios que coincidan con el término de búsqueda
	const filteredUsers = userElements.filter(userElement => {
		const username = userElement.querySelector("span.text-sm")?.textContent?.trim().toLowerCase() || "";
		return username.includes(keyword.toLowerCase());
	});

	// Limpiar el contenedor de usuarios
	itemsContainer.innerHTML = "";

	// Mostrar solo los usuarios que coincidan
	if (filteredUsers.length > 0) {
		filteredUsers.forEach(userElement => {
			itemsContainer.appendChild(userElement);
		});
	} else {
		// Si no hay coincidencias, mostrar un mensaje
		const noResultsElement = document.createElement("div");
		noResultsElement.className = "text-gray-500";
		noResultsElement.textContent = "No users found";
		itemsContainer.appendChild(noResultsElement);
	}
}
