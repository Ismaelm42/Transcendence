var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let htmlUsersConnected = '';
let inputKeyword = '';
function formatMsgTemplate(data, name) {
    return __awaiter(this, void 0, void 0, function* () {
        let htmlContent;
        if (data.username.toString() === name.toString()) {
            htmlContent = yield fetch("../../html/chat/msgTemplateUser.html");
        }
        else {
            htmlContent = yield fetch("../../html/chat/msgTemplatePartner.html");
        }
        let htmlText = yield htmlContent.text();
        htmlText = htmlText
            .replace("{{ username }}", data.username.toString())
            .replace("{{ timeStamp }}", data.timeStamp.toString())
            .replace("{{ message }}", data.message.toString())
            .replace("{{ imagePath }}", data.imagePath.toString())
            .replace("{{ usernameImage }}", data.username.toString());
        return htmlText;
    });
}
function formatConnectedUsersTemplate(data, name) {
    return __awaiter(this, void 0, void 0, function* () {
        let htmlText = '';
        let htmlContent;
        let userHtmlContent;
        const usersConnected = Object.values(data.object);
        for (const user of usersConnected) {
            userHtmlContent = yield fetch("../../html/chat/userListItem.html");
            htmlContent = yield userHtmlContent.text();
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
    });
}
function handleSocketOpen(socket) {
    socket.onopen = () => {
        const handshake = {
            type: 'handshake',
            message: ''
        };
        socket.send(JSON.stringify(handshake));
    };
}
function sortUsersAlphabetically(htmlContent) {
    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    const items = Array.from(container.querySelectorAll('.item'));
    items.sort((a, b) => {
        var _a, _b, _c, _d;
        const usernameA = ((_b = (_a = a.querySelector('span.text-sm')) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim().toLowerCase()) || '';
        const usernameB = ((_d = (_c = b.querySelector('span.text-sm')) === null || _c === void 0 ? void 0 : _c.textContent) === null || _d === void 0 ? void 0 : _d.trim().toLowerCase()) || '';
        return usernameA.localeCompare(usernameB);
    });
    const sortedHtml = items.map(item => item.outerHTML).join('');
    return sortedHtml;
}
function handleSocketMessage(socket, chatMessages, items, name) {
    socket.onmessage = (event) => __awaiter(this, void 0, void 0, function* () {
        const data = JSON.parse(event.data);
        if (data.type === 'message') {
            const HtmlContent = yield formatMsgTemplate(data, name);
            let stored = sessionStorage.getItem("chatHTML") || "";
            stored += HtmlContent;
            sessionStorage.setItem("chatHTML", stored);
            chatMessages.innerHTML = stored;
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        if (data.type === 'connectedUsers') {
            let HtmlContent = yield formatConnectedUsersTemplate(data, name);
            HtmlContent = sortUsersAlphabetically(HtmlContent);
            htmlUsersConnected = HtmlContent;
            filterSearchUsers(inputKeyword, name);
        }
    });
}
// TODO: Handle the case when the Socket close.
function handleSocketClose(socket) {
    socket.onclose = (event) => {
        console.log(`CLIENT: Connection closed - Code: ${event.code}`);
    };
}
// TODO: Handle the case when the Socket gets an error.
function handleSocketError(socket) {
    socket.onerror = (event) => {
        console.error("CLIENT: WebSocket error:", event);
    };
}
export function retrieveConnectedUsers(socket) {
    const message = {
        type: 'status',
        message: ''
    };
    socket.send(JSON.stringify(message));
}
export function handleSocket(socket, chatMessages, items, username) {
    handleSocketOpen(socket);
    handleSocketMessage(socket, chatMessages, items, username);
    handleSocketClose(socket);
    handleSocketError(socket);
    return socket;
}
export function handleTextareaKeydown(e, form) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        form.requestSubmit();
    }
}
export function handleFormSubmit(e, textarea, socket) {
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
export function filterSearchUsers(keyword, currentUserName) {
    inputKeyword = keyword;
    const itemsContainer = document.getElementById("item-container");
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = htmlUsersConnected;
    const userElements = Array.from(tempContainer.querySelectorAll(".item"));
    const filteredUsers = userElements.filter(userElement => {
        var _a, _b;
        const username = ((_b = (_a = userElement.querySelector("span.text-sm")) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim().toLowerCase()) || "";
        return username.includes(keyword.toLowerCase());
    });
    if (itemsContainer) {
        itemsContainer.innerHTML = "";
        if (filteredUsers.length > 0) {
            filteredUsers.forEach(userElement => {
                var _a, _b;
                itemsContainer.appendChild(userElement);
                const userName = (_b = (_a = userElement.querySelector("span.text-sm")) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim();
                if (userName !== currentUserName) {
                    userElement.addEventListener("click", (event) => {
                        showUserOptionsMenu(userElement, event);
                    });
                    userElement.addEventListener("dblclick", (event) => {
                        var _a, _b;
                        const username = (_b = (_a = userElement.querySelector("span.text-sm")) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim();
                        if (username) {
                            openPrivateChat(username);
                        }
                    });
                }
            });
        }
    }
}
function showUserOptionsMenu(userElement, event) {
    var _a, _b;
    const username = (_b = (_a = userElement.querySelector("span.text-sm")) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim();
    if (!username)
        return;
    const userId = userElement.id.replace("item-", "");
    if (!userId)
        return;
    const oldMenu = document.getElementById("user-options-menu");
    if (oldMenu) {
        oldMenu.remove();
    }
    const menu = createOptionMenu(event, userElement);
    document.body.appendChild(menu);
    addMenuOptionsListeners(menu, userId, username, event);
    // Cerrar el menú al hacer clic fuera de él
    // Cerrar el menú cuando el cursor sale del menú
    menu.addEventListener("mouseleave", () => {
        menu.remove();
    });
    event.stopPropagation();
}
function createOptionMenu(event, userElement) {
    const menu = document.createElement("div");
    menu.id = "user-options-menu";
    menu.className = "absolute bg-gray-900/95 border border-slate-200 rounded-xl shadow-2xl p-2 z-50";
    menu.innerHTML = `
		<div class="text-gray-300 cursor-pointer hover:bg-sky-700/80 p-2 rounded" data-action="msg"> • Private Message</div>
		<div class="text-gray-300 cursor-pointer hover:bg-sky-700/80 p-2 rounded" data-action="show-more"> ≡ Show More</div>
	`;
    const rect = userElement.getBoundingClientRect();
    // Calcula la posición: debajo del usuario, alineado horizontalmente con el click, pero no fuera del usuario
    let left = event.clientX - 10;
    let top = rect.top + rect.height + window.scrollY - 10;
    // Limita el menú para que no se salga de la pantalla
    document.body.appendChild(menu);
    const menuRect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    // Si el click está fuera del usuario, centra el menú respecto al usuario
    if (event.clientX < rect.left || event.clientX > rect.right) {
        left = rect.left + rect.width / 2 - menuRect.width / 2 + window.scrollX;
    }
    // Ajusta si se sale por la derecha
    if (left + menuRect.width > viewportWidth) {
        left = viewportWidth - menuRect.width - 10;
    }
    // Ajusta si se sale por la izquierda
    if (left < 10) {
        left = 10;
    }
    // Ajusta si se sale por abajo
    if (top + menuRect.height > viewportHeight) {
        top = viewportHeight - menuRect.height - 10;
    }
    // Nunca menos de 0
    top = Math.max(top, 10);
    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
    return menu;
}
function addMenuOptionsListeners(menu, userId, username, event) {
    menu.querySelectorAll("div").forEach((option) => {
        option.addEventListener("click", () => {
            const action = option.getAttribute("data-action");
            if (action) {
                switch (action) {
                    case "msg":
                        openPrivateChat(username);
                        break;
                    case "show-more":
                        showUserProfile(userId, username, event);
                        break;
                }
            }
            menu.remove();
        });
    });
}
function openPrivateChat(username) {
    let privateChat = document.getElementById("private-chat");
    if (privateChat) {
        privateChat.remove();
    }
    console.log("Abriendo chat privado con:", username);
}
function sendFriendRequest(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const requestBody = { friendId: userId };
            const response = yield fetch("https://localhost:8443/back/send_friend_request", {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });
            if (response.ok) {
                const data = yield response.json();
                console.log("Friend request sent successfully:", data);
            }
            else {
                const errorMessage = yield response.json();
                console.error("Error sending friend request:", errorMessage);
            }
        }
        catch (error) {
            console.error("Error sending friend request:", error);
        }
    });
}
function showUserProfile(userId, username, event) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingProfile = document.getElementById("user-profile-modal-backdrop");
        if (existingProfile)
            existingProfile.remove();
        const userData = yield fetchUserData(userId);
        const userStats = yield fetchUserStats(userId);
        const friendsEntries = yield fetchFriendEntries(userId);
        if (!userData || !userStats || !friendsEntries) {
            console.log("Error fetching user data or stats.");
            return;
        }
        const { isFriend, isPending, isBlocked } = yield checkFriendStatus(userId, friendsEntries);
        const friendButton = getFriendButton(isFriend, isPending, isBlocked);
        const blockUserButton = getBlockUserButton(isBlocked, userId);
        // Fondo semitransparente que NO cubre el header (ajusta top-[64px] si tu header es más alto o bajo)
        const backdrop = createBackdrop();
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
				${blockUserButton}
			</div>
		</div>
	`;
        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);
        setTimeout(() => {
            modal.style.opacity = "1";
            modal.style.transform = "scale(1)";
        }, 10);
        addProfileModalListeners(userId, backdrop);
    });
}
function fetchUserData(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`https://localhost:8443/back/get_user_by_id/?id=${userId}`, {
                method: "GET",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.ok) {
                return yield response.json();
            }
            else {
                throw new Error("Error fetching user data");
            }
        }
        catch (error) {
            console.error("Error fetching user data:", error);
            return null;
        }
    });
}
function fetchUserStats(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`https://localhost:8443/back/get_user_gamelogs/${userId}`, {
                method: "GET",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.ok) {
                return yield response.json();
            }
            else {
                throw new Error("Error fetching user stats");
            }
        }
        catch (error) {
            console.error("Error fetching user stats:", error);
            return null;
        }
    });
}
function fetchFriendEntries(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`https://localhost:8443/back/get_all_friends_entries_from_an_id`, {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId }),
            });
            if (response.ok) {
                return yield response.json();
            }
            else {
                throw new Error("Error fetching friend entries");
            }
        }
        catch (error) {
            console.error("Error fetching friend entries:", error);
            return null;
        }
    });
}
function checkFriendStatus(userId, friendsEntries) {
    return __awaiter(this, void 0, void 0, function* () {
        const blockedFriends = friendsEntries.filter((entry) => entry.status === "blocked");
        const isBlocked = blockedFriends.some((entry) => String(entry.friendId) === String(userId) || String(entry.userId) === String(userId));
        // Filtra solo los amigos aceptados
        const acceptedFriends = friendsEntries.filter((entry) => entry.status === "accepted");
        const pendingFriends = friendsEntries.filter((entry) => entry.status === "pending");
        // Comprueba si el userId mostrado es amigo
        const isFriend = acceptedFriends.some((entry) => String(entry.friendId) === String(userId) || String(entry.userId) === String(userId));
        const isPending = pendingFriends.some((entry) => String(entry.friendId) === String(userId) || String(entry.userId) === String(userId));
        return { isFriend, isPending, isBlocked };
    });
}
function getFriendButton(isFriend, isPending, isBlocked) {
    let friendButton = "";
    if (isFriend && !isBlocked) {
        friendButton = `<button id="del-friend-btn" class="bg-gray-600 hover:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold shadow">✔️ Friend</button>`;
    }
    else if (isPending && !isBlocked) {
        friendButton = `<button id="cancel-friend-btn" class="bg-yellow-600 hover:bg-yellow-400 text-white px-6 py-2 rounded-lg font-semibold shadow">⏳ Pending</button>`;
    }
    else if (!isFriend && !isPending && !isBlocked) {
        friendButton = `<button id="add-friend-btn" class="bg-blue-600 hover:bg-blue-400 text-white px-6 py-2 rounded-lg font-semibold shadow">➕ Add Friend</button>`;
    }
    return friendButton;
}
function getBlockUserButton(isBlocked, userId) {
    let blockUserButton = "";
    if (isBlocked) {
        blockUserButton = `<button id="unblock-user-btn" class="bg-red-600 hover:bg-red-400 text-white px-6 py-2 rounded-lg font-semibold shadow">🔓 Unblock User</button>`;
    }
    else {
        blockUserButton = `<button id="block-user-btn" class="bg-red-600 hover:bg-red-400 text-white px-6 py-2 rounded-lg font-semibold shadow">🔒 Block User</button>`;
    }
    return blockUserButton;
}
function createBackdrop() {
    const backdrop = document.createElement("div");
    backdrop.id = "user-profile-modal-backdrop";
    backdrop.className = "fixed left-0 right-0 bottom-0 top-[160px] bg-black/50 flex items-center justify-center z-40";
    backdrop.style.animation = "fadeIn 0.2s";
    return backdrop;
}
function addProfileModalListeners(userId, backdrop) {
    var _a, _b, _c, _d, _e, _f;
    (_a = document.getElementById("close-profile-modal")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
        backdrop.remove();
    });
    (_b = document.getElementById("add-friend-btn")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
        sendFriendRequest(userId);
        backdrop.remove();
    });
    (_c = document.getElementById("cancel-friend-btn")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
        yield rejectFriendRequest(userId);
        backdrop.remove();
    }));
    (_d = document.getElementById("del-friend-btn")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", () => {
        deleteFriend(userId);
        backdrop.remove();
    });
    (_e = document.getElementById("block-user-btn")) === null || _e === void 0 ? void 0 : _e.addEventListener("click", () => {
        blockUser(userId);
        backdrop.remove();
    });
    (_f = document.getElementById("unblock-user-btn")) === null || _f === void 0 ? void 0 : _f.addEventListener("click", () => {
        unblockUser(userId);
        backdrop.remove();
    });
    backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop)
            backdrop.remove();
    });
}
function rejectFriendRequest(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch("https://localhost:8443/back/reject_friend_request", {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ friendId: userId }),
            });
            if (response.ok) {
                alert("Solicitud de amistad cancelada.");
            }
            else {
                const errorMessage = yield response.json();
                alert("Error al cancelar la solicitud: " + errorMessage.error);
            }
        }
        catch (error) {
            alert("Error al cancelar la solicitud: " + error);
        }
    });
}
function deleteFriend(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`https://localhost:8443/back/delete_friend`, {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ friendId: userId }),
            });
            if (response.ok) {
                alert("Friend deleted");
            }
            else {
                const errorMessage = yield response.json();
                alert("Error al cancelar la solicitud: " + errorMessage.error);
            }
        }
        catch (error) {
            alert("Error al cancelar la solicitud: " + error);
        }
    });
}
function blockUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`https://localhost:8443/back/block_user`, {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ friendId: userId }),
            });
            if (response.ok) {
                alert("Friend deleted");
            }
            else {
                const errorMessage = yield response.json();
                alert("Error al cancelar la solicitud: " + errorMessage.error);
            }
        }
        catch (error) {
            alert("Error al cancelar la solicitud: " + error);
        }
    });
}
function unblockUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`https://localhost:8443/back/unblock_user`, {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ friendId: userId }),
            });
            if (response.ok) {
                alert("User unblocked");
            }
            else {
                const errorMessage = yield response.json();
                alert("Error al cancelar la solicitud: " + errorMessage.error);
            }
        }
        catch (error) {
            alert("Error al cancelar la solicitud: " + error);
        }
    });
}
