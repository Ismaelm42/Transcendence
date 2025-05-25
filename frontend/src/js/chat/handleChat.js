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
                .replace("{{ id }}", user.id.toString())
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
    if (items.length > 0) {
        const target = items[0].querySelector('.item-wrapper');
        if (target) {
            target.classList.add("border-t");
        }
    }
    const sortedHtml = items.map(item => item.outerHTML).join('');
    return sortedHtml;
}
function handleSocketMessage(socket, chatMessages, items, name) {
    socket.onmessage = (event) => __awaiter(this, void 0, void 0, function* () {
        const data = JSON.parse(event.data);
        let HtmlContent = "";
        let stored = "";
        if (data.type === 'message') {
            HtmlContent = yield formatMsgTemplate(data, name);
            stored = sessionStorage.getItem("public-chat") || "";
            stored += HtmlContent;
            sessionStorage.setItem("public-chat", stored);
            sessionStorage.setItem("current-room", "");
            chatMessages.innerHTML = stored;
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        if (data.type === 'private') {
            console.log(data);
            if (data.message) {
                HtmlContent = yield formatMsgTemplate(data, name);
            }
            const privateChat = JSON.parse(sessionStorage.getItem("private-chat") || "{}");
            stored = privateChat[data.roomId] || "";
            stored += HtmlContent || "";
            privateChat[data.roomId] = stored || "";
            sessionStorage.setItem("private-chat", JSON.stringify(privateChat));
            sessionStorage.setItem("current-room", data.roomId);
            chatMessages.innerHTML = stored || "";
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        if (data.type === 'connectedUsers') {
            HtmlContent = yield formatConnectedUsersTemplate(data, name);
            HtmlContent = sortUsersAlphabetically(HtmlContent);
            htmlUsersConnected = HtmlContent;
            filterSearchUsers(inputKeyword);
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
function retrieveConnectedUsers(socket) {
    const message = {
        type: 'status',
        message: ''
    };
    socket.send(JSON.stringify(message));
}
export function handleSessionStorage(chatMessages, socket) {
    const currentRoom = sessionStorage.getItem("current-room") || "";
    const publicChat = sessionStorage.getItem("public-chat") || "";
    const privateChat = JSON.parse(sessionStorage.getItem("private-chat") || "{}");
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
    return socket;
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
            };
        }
        socket.send(JSON.stringify(message));
        textarea.value = '';
    }
}
export function filterSearchUsers(keyword) {
    inputKeyword = keyword;
    const itemsContainer = document.getElementById("user-item-container");
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
                itemsContainer.appendChild(userElement);
            });
        }
    }
}
export function handlePrivateMsg(e, items, username, socket) {
    const target = e.target;
    const userDiv = target.closest('[data-id]');
    if (!userDiv)
        return;
    const id = userDiv.dataset.id;
    const message = {
        type: 'private',
        id: id,
    };
    socket.send(JSON.stringify(message));
}
