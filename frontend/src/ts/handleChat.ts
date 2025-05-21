let htmlUsersConnected = '';
let inputKeyword = '';

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
	const usersConnected = Object.values(data.object) as { userId: string; username: string; imagePath: string; status: string }[];
	console.log("Connected users:", usersConnected);
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
			filterSearchUsers(inputKeyword);
			//items.innerHTML = HtmlContent;
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

export function retrieveConnectedUsers(socket: WebSocket) {

	const message = {
		type: 'status',
		message: ''
	};
	socket.send(JSON.stringify(message));
}

export function handleSocket(socket: WebSocket, chatMessages: HTMLDivElement, items: HTMLDivElement, username: string): WebSocket {

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
	inputKeyword = keyword;
	const itemsContainer = document.getElementById("item-container") as HTMLDivElement;
	if (!itemsContainer) {
		console.error("Items container not found");
		return;
	}

	const tempContainer = document.createElement("div");
	tempContainer.innerHTML = htmlUsersConnected;


	const userElements = Array.from(tempContainer.querySelectorAll(".item")) as HTMLDivElement[];

	const filteredUsers = userElements.filter(userElement => {
		const username = userElement.querySelector("span.text-sm")?.textContent?.trim().toLowerCase() || "";
		return username.includes(keyword.toLowerCase());
	});

	itemsContainer.innerHTML = "";

	if (filteredUsers.length > 0) {
		filteredUsers.forEach(userElement => {
			itemsContainer.appendChild(userElement);
			userElement.addEventListener("click", (event) => {
				showUserOptionsMenu(userElement, event)
			});
		});
	}
}

function showUserOptionsMenu(userElement: HTMLDivElement, event: MouseEvent) {
	console.log(userElement);
	const username = userElement.querySelector("span.text-sm")?.textContent?.trim();
	if (!username) return;

	const oldMenu = document.getElementById("user-options-menu");
	if (oldMenu) {
		oldMenu.remove();
	}
	const menu = document.createElement("div");
	menu.id = "user-options-menu";
	menu.className = "absolute bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-50";

	menu.innerHTML = `
		<div class="text-gray-700 cursor-pointer hover:bg-gray-100 p-2 rounded" data-action="add">➕ Agregar amigo</div>
		<div class="text-gray-700 cursor-pointer hover:bg-gray-100 p-2 rounded" data-action="msg">📩 Mensaje privado</div>
		<div class="text-gray-700 cursor-pointer hover:bg-gray-100 p-2 rounded" data-action="block">🚫 Bloquear</div>
	`
	menu.style.top = `${event.clientY + 5}px`;
	menu.style.left = `${event.clientX + 5}px`;

	document.body.appendChild(menu);

	menu.querySelectorAll("div").forEach((option) => {
		option.addEventListener("click", () => {
			const action = option.getAttribute("data-action");
			if (action) {
				switch (action) {
					case "add":
						console.log(`Agregar amigo a ${username}`);
						//sendFriendRequest(userId!);
						break;
					case "msg":
						console.log(`Mensaje privado a ${username}`);
						openPrivateChat(username);
						break;
					case "block":
						console.log(`Bloquear a ${username}`);
						break;
				}
			}
			menu.remove();
		});
	});
	// Cerrar el menú al hacer clic fuera de él
	const handleClickOutside = (e: MouseEvent) => {
		if (!menu.contains(e.target as Node)) {
			menu.remove();
			document.removeEventListener("click", handleClickOutside);
		}
	};
	document.addEventListener("click", handleClickOutside);
	event.stopPropagation();
}

function openPrivateChat(username: string) {
	let privateChat = document.getElementById("private-chat");
	if (privateChat) {
		privateChat.remove();
	}
	console.log("Abriendo chat privado con:", username);
}

async function sendFriendRequest(userId: string): Promise<void> {
	console.log("Enviando solicitud de amistad a:", userId);
	try {
		const requestBody = { friendId: userId };
		console.log("Request body:", requestBody);
		const response = await fetch("https://localhost:8443/back/send_friend_request", {
			method: "POST",
			credentials: 'include',
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(requestBody),
		});
		console.log("Response---------------D:", response);
		if (response.ok) {
			const data = await response.json();
			console.log("Friend request sent successfully:", data);
		}
		else {
			const errorMessage = await response.json();
			console.error("Error sending friend request:", errorMessage);
		}
	} catch (error) {
		console.error("Error sending friend request:", error);
	}

}