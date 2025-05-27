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
	const usersConnected = Object.values(data.object) as { userId: string; username: string; imagePath: string; status: string }[];
	for (const user of usersConnected) {
		userHtmlContent = await fetch("../../html/chat/userListItem.html");
		htmlContent = await userHtmlContent.text();
		htmlContent = htmlContent
			.replace("{{ userId }}", user.userId.toString())
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
			filterSearchUsers(inputKeyword, name);
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

export function filterSearchUsers(keyword: string, currentUserName: string): void {
	inputKeyword = keyword;
	const itemsContainer = document.getElementById("item-container") as HTMLDivElement;
	const tempContainer = document.createElement("div");
	tempContainer.innerHTML = htmlUsersConnected;
	const userElements = Array.from(tempContainer.querySelectorAll(".item")) as HTMLDivElement[];
	const filteredUsers = userElements.filter(userElement => {
		const username = userElement.querySelector("span.text-sm")?.textContent?.trim().toLowerCase() || "";
		return username.includes(keyword.toLowerCase());
	});
	if (itemsContainer) {
		itemsContainer.innerHTML = "";
		if (filteredUsers.length > 0) {
			filteredUsers.forEach(userElement => {
				itemsContainer.appendChild(userElement);
				const userName = userElement.querySelector("span.text-sm")?.textContent?.trim();
				if (userName !== currentUserName) {
					userElement.addEventListener("click", (event) => {
						showUserOptionsMenu(userElement, event as MouseEvent);
					});
					userElement.addEventListener("dblclick", (event) => {
						const username = userElement.querySelector("span.text-sm")?.textContent?.trim();
						if (username) {
							openPrivateChat(username);
						}
					});
				}
			});
		}
	}
}

function showUserOptionsMenu(userElement: HTMLDivElement, event: MouseEvent) {
	const username = userElement.querySelector("span.text-sm")?.textContent?.trim();
	if (!username) return;

	const userId = userElement.id.replace("item-", "");
	console.log("userId", userId);
	if (!userId) return;

	const oldMenu = document.getElementById("user-options-menu");
	if (oldMenu) {
		oldMenu.remove();
	}
	const menu = document.createElement("div");
	menu.id = "user-options-menu";
	menu.className = "absolute bg-gray-900/80 border border-slate-200 rounded-xl shadow-2xl p-2 z-50";
	menu.innerHTML = `
		<div class="text-gray-300 cursor-pointer hover:bg-sky-700/80 p-2 rounded" data-action="msg"> • Private Message</div>
		<div class="text-gray-300 cursor-pointer hover:bg-sky-700/80 p-2 rounded" data-action="show-more"> ≡ Show More</div>
	`
	menu.style.top = `${event.clientY + 5}px`;
	menu.style.left = `${event.clientX + 5}px`;

	document.body.appendChild(menu);

	menu.querySelectorAll("div").forEach((option) => {
		option.addEventListener("click", () => {
			const action = option.getAttribute("data-action");
			if (action) {
				switch (action) {
					case "msg":
						console.log(`Mensaje privado a ${username}`);
						openPrivateChat(username);
						break;
					case "show-more":
						showUserProfile(userId, username, event);
						console.log(`Mostrar más opciones para ${username}`);
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
		const response = await fetch("https://localhost:8443/back/send_friend_request", {
			method: "POST",
			credentials: 'include',
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(requestBody),
		});
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

async function showUserProfile(userId: string, username: string, event?: MouseEvent) {
	const existingProfile = document.getElementById("user-profile-modal-backdrop");
	if (existingProfile) existingProfile.remove();

	const userRes = await fetch(`https://localhost:8443/back/get_user_by_id/?id=${userId}`, {
		method: "GET",
		credentials: 'include',
		headers: {
			"Content-Type": "application/json",
		},
	});
	const userData = await userRes.json();

	const statsRes = await fetch(`https://localhost:8443/back/get_user_gamelogs/${userId}`, {
		method: "GET",
		credentials: 'include',
		headers: {
			"Content-Type": "application/json",
		},
	});
	const userStats = await statsRes.json();

	const friendRes = await fetch(`https://localhost:8443/back/get_all_friends_entries_from_an_id`, {
    	method: "POST",
    	credentials: 'include',
    	headers: {
        	"Content-Type": "application/json",
    	},
		body: JSON.stringify({})
	});
	const friendsEntries = await friendRes.json();

	console.log("friendsEntries", friendsEntries);
	// Filtra solo los amigos aceptados
	const acceptedFriends = friendsEntries.filter((entry: any) => entry.status === "accepted");

	const pendingFriends = friendsEntries.filter((entry: any) => entry.status === "pending");

	// Comprueba si el userId mostrado es amigo
	const isFriend = acceptedFriends.some((entry: any) =>
   	 String(entry.friendId) === String(userId) || String(entry.userId) === String(userId)
	);

	const isPending = pendingFriends.some((entry: any) =>
   	 String(entry.friendId) === String(userId) || String(entry.userId) === String(userId)
	);


	let friendButton= "";
	if (isFriend) {
	friendButton = `<button id="del-friend-btn" class="bg-gray-600 hover:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold shadow">✔️ Friend</button>`;
	} else if (isPending) {
	friendButton = `<button id="cancel-friend-btn" class="bg-yellow-600 hover:bg-yellow-400 text-white px-6 py-2 rounded-lg font-semibold shadow">⏳ Pending</button>`;
	} else {
	friendButton =`<button id="add-friend-btn" class="bg-blue-600 hover:bg-blue-400 text-white px-6 py-2 rounded-lg font-semibold shadow">➕ Add Friend</button>`;
	}
	// Fondo semitransparente que NO cubre el header (ajusta top-[64px] si tu header es más alto o bajo)
	const backdrop = document.createElement("div");
	backdrop.id = "user-profile-modal-backdrop";
	backdrop.className = "fixed left-0 right-0 bottom-0 top-[64px] bg-black/50 flex items-center justify-center z-40";
	backdrop.style.animation = "fadeIn 0.2s";

	// Modal centrado con transparencia
	const modal = document.createElement("div");
	modal.className = "bg-gray/900 backdrop-blur-md rounded-xl shadow-2xl p-10 w-full max-w-2xl border-1 border-blue-500 relative scale-95 opacity-0";
	modal.style.transition = "opacity 0.5s, transform 0.5s";

	modal.innerHTML = `
		<button id="close-profile-modal" class="absolute top-4 right-6 text-blue-500 hover:text-blue-700 text-4xl font-bold">&times;</button>
		<div class="flex flex-col items-center text-white">
			<img src="${userData.avatarPath}" alt="Avatar" class="w-40 h-40 rounded-full mb-6 border-4 border-blue-500 shadow">
			<h2 class="text-3xl font-extrabold mb-2 text-blue-500">${username}</h2>
			<ul class="mb-8 text-lg">
				<li><span class="font-semibold">🎮  Partidas jugadas:</span> ${userStats.totalGames}</li>
				<li><span class="font-semibold">🏆  Victorias:</span> ${userStats.wins}</li>
				<li><span class="font-semibold">❌  Derrotas:</span> ${userStats.losses}</li>
			</ul>
			<div class="flex gap-4 mt-2">
				${friendButton}
				<button id="block-user-btn" class="bg-red-800 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-semibold shadow">🚫 Block User</button>
			</div>
		</div>
	`;

	backdrop.appendChild(modal);
	document.body.appendChild(backdrop);

	setTimeout(() => {
		modal.style.opacity = "1";
		modal.style.transform = "scale(1)";
	}, 10);

	document.getElementById("close-profile-modal")?.addEventListener("click", () => {
		backdrop.remove();
	});

	document.getElementById("add-friend-btn")?.addEventListener("click", () => {
		sendFriendRequest(userId);
		backdrop.remove();
	});

	document.getElementById("cancel-friend-btn")?.addEventListener("click", async () => {
    	await rejectFriendRequest(userId);
    	backdrop.remove();
	});

	document.getElementById("del-friend-btn")?.addEventListener("click", () => {
		deleteFriend(userId);
		backdrop.remove();
	});
	document.getElementById("block-user-btn")?.addEventListener("click", () => {
		blockUser(userId);
		backdrop.remove();
	});

	backdrop.addEventListener("click", (e) => {
		if (e.target === backdrop) backdrop.remove();
	});
}

async function rejectFriendRequest(userId: string): Promise<void> {
    try {
        const response = await fetch("https://localhost:8443/back/reject_friend_request", {
            method: "POST",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ friendId: userId }),
        });
        if (response.ok) {
            alert("Solicitud de amistad cancelada.");
        } else {
            const errorMessage = await response.json();
            alert("Error al cancelar la solicitud: " + errorMessage.error);
        }
    } catch (error) {
        alert("Error al cancelar la solicitud: " + error);
    }
}

async function deleteFriend(userId: string) {
	try {
		const response = await fetch(`https://localhost:8443/back/delete_friend`, {
			method:  "POST",
			credentials: 'include',
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({friendId: userId}),
		});
		if (response.ok) {
			alert("Friend deleted");
		} else {
            const errorMessage = await response.json();
            alert("Error al cancelar la solicitud: " + errorMessage.error);
        }
    } catch (error) {
       	alert("Error al cancelar la solicitud: " + error);
   	}
}

async function blockUser(userId: string) {
	try {
		const response = await fetch(`https://localhost:8443/back/block_user`, {
			method:  "POST",
			credentials: 'include',
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({friendId: userId}),
		});
		if (response.ok) {
			alert("Friend deleted");
		} else {
            const errorMessage = await response.json();
            alert("Error al cancelar la solicitud: " + errorMessage.error);
        }
    } catch (error) {
       	alert("Error al cancelar la solicitud: " + error);
   	}
}
