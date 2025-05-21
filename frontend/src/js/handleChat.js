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
            htmlContent = yield fetch("../html/msgTemplateUser.html");
        }
        else {
            htmlContent = yield fetch("../html/msgTemplatePartner.html");
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
        console.log("Connected users:", usersConnected);
        for (const user of usersConnected) {
            userHtmlContent = yield fetch("../html/userListItem.html");
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
            filterSearchUsers(inputKeyword);
            //items.innerHTML = HtmlContent;
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
/**
 * Take the keyword from the search input and filter the list of connected users.
 * @param keyword - The keyword to search for in the list of connected users.
 * @returns
 */
export function filterSearchUsers(keyword) {
    inputKeyword = keyword;
    const itemsContainer = document.getElementById("item-container");
    if (!itemsContainer) {
        console.error("Items container not found");
        return;
    }
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = htmlUsersConnected;
    const userElements = Array.from(tempContainer.querySelectorAll(".item"));
    const filteredUsers = userElements.filter(userElement => {
        var _a, _b;
        const username = ((_b = (_a = userElement.querySelector("span.text-sm")) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim().toLowerCase()) || "";
        return username.includes(keyword.toLowerCase());
    });
    itemsContainer.innerHTML = "";
    if (filteredUsers.length > 0) {
        filteredUsers.forEach(userElement => {
            itemsContainer.appendChild(userElement);
            userElement.addEventListener("click", (event) => {
                showUserOptionsMenu(userElement, event);
            });
        });
    }
}
function showUserOptionsMenu(userElement, event) {
    var _a, _b;
    console.log(userElement);
    const username = (_b = (_a = userElement.querySelector("span.text-sm")) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim();
    if (!username)
        return;
    const userId = userElement.id.replace("item-", "");
    console.log("userId", userId);
    if (!userId)
        return;
    const oldMenu = document.getElementById("user-options-menu");
    if (oldMenu) {
        oldMenu.remove();
    }
    const menu = document.createElement("div");
    menu.id = "user-options-menu";
    menu.className = "absolute bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-50";
    menu.innerHTML = `
		<div class="text-gray-700 cursor-pointer hover:bg-gray-100 p-2 rounded" data-action="add">➕ Add Friend</div>
		<div class="text-gray-700 cursor-pointer hover:bg-gray-100 p-2 rounded" data-action="msg">📩 Private Message</div>
		<div class="text-gray-700 cursor-pointer hover:bg-gray-100 p-2 rounded" data-action="block">🚫 Block</div>
	`;
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
                        sendFriendRequest(userId);
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
    const handleClickOutside = (e) => {
        if (!menu.contains(e.target)) {
            menu.remove();
            document.removeEventListener("click", handleClickOutside);
        }
    };
    document.addEventListener("click", handleClickOutside);
    event.stopPropagation();
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
        console.log("Enviando solicitud de amistad a:", userId);
        try {
            const requestBody = { friendId: userId };
            console.log("Request body:", requestBody);
            const response = yield fetch("https://localhost:8443/back/send_friend_request", {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });
            console.log("Response---------------D:", response);
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
