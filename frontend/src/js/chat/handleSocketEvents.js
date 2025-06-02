var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { filterSearchUsers } from "./filterSearch.js";
import { removeNotificationAndUpdateHTML } from "./loadAndUpdateDOM.js";
import { handleUserInfo, updatePartnerStatus } from "./handleUserInfo.js";
import { inputKeyword, setHtmlUsersConnected } from "./state.js";
import { soundNotification, formatMsgTemplate, formatRecentChatTemplate, formatConnectedUsersTemplate, sortUsersAlphabetically } from "./formatContent.js";
function handleSocketOpen(socket) {
    socket.onopen = () => {
        const handshake = {
            type: 'handshake',
            message: ''
        };
        socket.send(JSON.stringify(handshake));
    };
}
function handlePublicChatMsg(chatMessages, data, name) {
    return __awaiter(this, void 0, void 0, function* () {
        const HtmlContent = yield formatMsgTemplate(data, name);
        let stored = sessionStorage.getItem("public-chat") || "";
        stored += HtmlContent;
        sessionStorage.setItem("public-chat", stored);
        if (sessionStorage.getItem("current-room") === "") {
            chatMessages.innerHTML = stored || "";
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    });
}
function handlePrivateChatMsg(chatMessages, recentChats, data, name) {
    return __awaiter(this, void 0, void 0, function* () {
        if (name === data.partnerUsername && sessionStorage.getItem("current-room") !== data.roomId) {
            soundNotification();
        }
        if (name === data.partnerUsername && sessionStorage.getItem("current-view") !== "Chat") {
            const chatTab = document.querySelector('a[href="#chat"]');
            chatTab === null || chatTab === void 0 ? void 0 : chatTab.classList.add('blink');
        }
        const HtmlContent = yield formatMsgTemplate(data, name);
        const HtmlChat = yield formatRecentChatTemplate(recentChats, data, name);
        recentChats.innerHTML = HtmlChat || "";
        sessionStorage.setItem("recent-chats", HtmlChat || "");
        const privateChat = JSON.parse(sessionStorage.getItem("private-chat") || "{}");
        let stored = privateChat[data.roomId] || "";
        stored += HtmlContent || "";
        privateChat[data.roomId] = stored || "";
        sessionStorage.setItem("private-chat", JSON.stringify(privateChat));
        if (sessionStorage.getItem("current-room") === data.roomId) {
            chatMessages.innerHTML = stored || "";
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    });
}
function handleConnectedUsers(data) {
    return __awaiter(this, void 0, void 0, function* () {
        let HtmlContent = yield formatConnectedUsersTemplate(data);
        HtmlContent = sortUsersAlphabetically(HtmlContent);
        setHtmlUsersConnected(HtmlContent);
        filterSearchUsers(inputKeyword);
    });
}
function handleSocketMessage(socket, chatMessages, recentChats, name) {
    socket.onmessage = (event) => __awaiter(this, void 0, void 0, function* () {
        const data = JSON.parse(event.data);
        if (data.type === 'message') {
            sessionStorage.setItem("JSONdata", JSON.stringify(data));
            handlePublicChatMsg(chatMessages, data, name);
        }
        if (data.type === 'private') {
            removeNotificationAndUpdateHTML(data.roomId);
            if (name === data.username) {
                sessionStorage.setItem("JSONdata", JSON.stringify(data));
            }
            if (!data.message) {
                handleUserInfo(chatMessages, data, name);
            }
            else {
                handlePrivateChatMsg(chatMessages, recentChats, data, name);
            }
        }
        if (data.type === 'connectedUsers') {
            sessionStorage.setItem("JSONusers", JSON.stringify(data));
            handleConnectedUsers(data);
            if (sessionStorage.getItem("current-room") !== "") {
                updatePartnerStatus();
            }
        }
    });
}
function handleSocketClose(socket) {
    socket.onclose = (event) => {
        console.log(`CLIENT: Connection closed - Code: ${event.code}`);
        // throw new Error("WebSocket connection closed unexpectedly.");
    };
}
function handleSocketError(socket) {
    socket.onerror = (event) => {
        console.error("CLIENT: WebSocket error:", event);
        // throw new Error("WebSocket error occurred.");
    };
}
export function handleSocketEvents(socket, chatMessages, recentChats, username) {
    handleSocketOpen(socket);
    handleSocketMessage(socket, chatMessages, recentChats, username);
    handleSocketClose(socket);
    handleSocketError(socket);
    return socket;
}
