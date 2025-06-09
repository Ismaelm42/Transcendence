var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { formatUserInfo } from "./formatContent.js";
export function updatePartnerStatus() {
    const data = JSON.parse(sessionStorage.getItem("JSONdata") || "{}");
    const usersConnected = JSON.parse(sessionStorage.getItem("JSONusers") || "{}");
    const user = usersConnected.object.find((user) => user.userId === data.partnerId) || {};
    const baseColor = user.status || "slate";
    const bgCode = baseColor === "slate" ? "700" : "500";
    const bgColor = `${baseColor}-${bgCode}`;
    const span = document.querySelector('#user-info span');
    if (span) {
        let classes = span.className;
        classes = classes
            .replace(/bg-[\w-]+/, `bg-${bgColor}`)
            .replace(/border-[\w-]+-50/, `border-${baseColor}-50`)
            .replace(/glow-[\w-]+/, `glow-${baseColor}`);
        span.className = classes;
    }
}
export function handleUserInfo(chatMessages, data, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (userId === data.userId) {
            const UserInfo = document.getElementById("user-info-container");
            UserInfo.innerHTML = yield formatUserInfo(data);
            const privateChat = JSON.parse(sessionStorage.getItem("private-chat") || "{}");
            const stored = privateChat[data.roomId] || "";
            chatMessages.innerHTML = stored || "";
            requestAnimationFrame(() => {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            });
            const button = UserInfo.querySelector("#back-group-chat");
            button.addEventListener('click', (e) => {
                e.preventDefault();
                sessionStorage.setItem("current-room", "");
                const stored = sessionStorage.getItem("public-chat") || "";
                UserInfo.innerHTML = "";
                chatMessages.innerHTML = stored;
                requestAnimationFrame(() => {
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                });
            });
        }
    });
}
