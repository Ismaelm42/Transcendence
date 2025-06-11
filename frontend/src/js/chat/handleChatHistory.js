var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function showPrivateChat(e, socket, chatMessages) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("showPrivateChat");
        const target = e.target;
        const chatDiv = target.closest('[id^="chat-item-"]');
        if (!chatDiv)
            return;
        const id = chatDiv.id;
        const roomId = id.replace("chat-item-", "");
        const currentRoom = sessionStorage.getItem("current-room") || "";
        if (currentRoom !== roomId) {
            const data = JSON.parse(sessionStorage.getItem("JSONdata") || "{}");
            const [id1, id2] = roomId.split("-");
            const id = id1 === data.userId ? id1 : id2;
            console.log("id", id);
            const message = {
                type: 'private',
                id: id,
            };
            socket.send(JSON.stringify(message));
        }
    });
}
