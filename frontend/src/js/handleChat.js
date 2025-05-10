var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        console.log("ESTOYT AQUI");
        console.log(usersConnected);
        for (const user of usersConnected) {
            // if (user.username.toString() !== name.toString()) {
            userHtmlContent = yield fetch("../html/userListItem.html");
            htmlContent = yield userHtmlContent.text();
            htmlContent = htmlContent
                .replace("{{ username }}", user.username.toString())
                .replace("{{ usernameImage }}", user.username.toString())
                .replace("{{ imagePath }}", user.imagePath.toString());
            htmlText += htmlContent;
            // }
        }
        return htmlText;
    });
}
function handleSocketOpen(socket) {
    socket.onopen = () => {
        const handshake = {
            type: 'handshake',
            message: 'hi'
        };
        socket.send(JSON.stringify(handshake));
    };
}
function handleSocketMessage(socket, chatMessages, items, name) {
    socket.onmessage = (event) => __awaiter(this, void 0, void 0, function* () {
        const data = JSON.parse(event.data);
        if (data.type === 'message') {
            const HtmlContent = yield formatMsgTemplate(data, name);
            chatMessages.insertAdjacentHTML('beforeend', HtmlContent);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        if (data.type === 'connectedUsers') {
            const HtmlContent = yield formatConnectedUsersTemplate(data, name);
            items.innerHTML = HtmlContent;
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
export function handleSocket(chatMessages, items, username) {
    const socket = new WebSocket("https://localhost:8443/back/ws/chat");
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
