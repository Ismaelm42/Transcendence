export function showPrivateChat(e, chatMessages) {
    const target = e.target;
    const chatDiv = target.closest('[chat-item-]');
    if (!chatDiv)
        return;
    const id = chatDiv.id;
    const roomId = id.replace("chat-item-", "");
    const currentRoom = sessionStorage.getItem("current-room") || "";
    if (currentRoom !== roomId) {
        sessionStorage.setItem("current-room", roomId);
        const privateChat = JSON.parse(sessionStorage.getItem("private-chat") || "{}");
        let stored = privateChat[roomId] || "";
        chatMessages.innerHTML = stored || "";
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}
