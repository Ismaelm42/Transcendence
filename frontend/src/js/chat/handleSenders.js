var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { removeNotificationAndUpdateHTML } from "./loadAndUpdateDOM.js";
export function getUserId(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = yield fetch("https://localhost:8443/back/getIdByUsername", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: username
            }),
        });
        if (!id.ok) {
            throw new Error("Failed to fetch user ID");
        }
        return id.text();
    });
}
export function retrieveConnectedUsers(socket) {
    const message = {
        type: 'status',
        message: ''
    };
    socket.send(JSON.stringify(message));
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
export function handlePrivateMsg(e, socket) {
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
export function showPrivateChat(e, socket, userId) {
    const target = e.target;
    const chatDiv = target.closest('[id^="chat-item-"]');
    if (!chatDiv)
        return;
    const currentRoom = sessionStorage.getItem("current-room") || "";
    const roomId = (chatDiv.id).replace("chat-item-", "");
    removeNotificationAndUpdateHTML(roomId);
    if (currentRoom !== roomId) {
        const [id1, id2] = roomId.split("-");
        const id = id1 === userId ? id2 : id1;
        console.log("id", id);
        const message = {
            type: 'private',
            id: id,
        };
        socket.send(JSON.stringify(message));
    }
}
