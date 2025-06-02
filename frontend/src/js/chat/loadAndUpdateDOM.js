import { handleUserInfo } from "./handleUserInfo.js";
export function removeNotificationChatTab() {
    const chatTab = document.querySelector('a[href="#chat"]');
    chatTab === null || chatTab === void 0 ? void 0 : chatTab.classList.remove('blink');
}
export function removeNotificationAndUpdateHTML(roomId) {
    const chatItem = document.getElementById("chat-item-" + roomId);
    if (chatItem) {
        chatItem.classList.remove('animate-flash-bg');
        chatItem.style.backgroundColor = '';
        let chatsHtml = sessionStorage.getItem("recent-chats") || "";
        const parser = new DOMParser();
        const doc = parser.parseFromString(chatsHtml, "text/html");
        const chatElement = doc.getElementById(`chat-item-${roomId}`);
        if (chatElement) {
            chatElement.classList.remove('animate-flash-bg');
            sessionStorage.setItem("recent-chats", doc.body.innerHTML);
        }
    }
}
export function handleContentStorage(chatMessages, recentChats, username) {
    const chats = sessionStorage.getItem("recent-chats") || "";
    const currentRoom = sessionStorage.getItem("current-room") || "";
    const publicChat = sessionStorage.getItem("public-chat") || "";
    const data = JSON.parse(sessionStorage.getItem("JSONdata") || "{}");
    if (chats) {
        recentChats.innerHTML = chats;
    }
    if (!currentRoom && publicChat) {
        chatMessages.innerHTML = publicChat;
    }
    if (!currentRoom) {
        sessionStorage.setItem("current-room", "");
    }
    if (currentRoom) {
        handleUserInfo(chatMessages, data, username);
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
