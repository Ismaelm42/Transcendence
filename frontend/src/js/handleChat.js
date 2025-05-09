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
        let HtmlContent;
        if (data.username.toString() === name.toString()) {
            HtmlContent = yield fetch("../html/msgTemplateUser.html");
        }
        else {
            HtmlContent = yield fetch("../html/msgTemplatePartner.html");
        }
        let htmlText = yield HtmlContent.text();
        htmlText = htmlText
            .replace("{{ username }}", data.username.toString())
            .replace("{{ timeStamp }}", data.timeStamp.toString())
            .replace("{{ message }}", data.message.toString())
            .replace("{{ messageStatus }}", data.messageStatus.toString())
            .replace("{{ imagePath }}", data.imagePath.toString())
            .replace("{{ usernameImage }}", data.username.toString());
        console.log(htmlText);
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
function handleSocketMessage(socket, chatMessages, name) {
    socket.onmessage = (event) => __awaiter(this, void 0, void 0, function* () {
        const data = JSON.parse(event.data);
        if (data.type === 'message') {
            const HtmlContent = yield formatMsgTemplate(data, name);
            chatMessages.insertAdjacentHTML('beforeend', HtmlContent);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    });
}
function handleSocketClose(socket) {
    socket.onclose = (event) => {
        console.log(`CLIENT: Connection closed - Code: ${event.code}`);
    };
}
function handleSocketError(socket) {
    socket.onerror = (event) => {
        console.error("CLIENT: WebSocket error:", event);
    };
}
export function handleSocket(chatMessages, username) {
    const socket = new WebSocket("https://localhost:8443/back/ws/chat");
    handleSocketOpen(socket);
    handleSocketMessage(socket, chatMessages, username);
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
    const message = textarea.value.trim();
    if (message) {
        socket.send(message);
        textarea.value = '';
    }
}
