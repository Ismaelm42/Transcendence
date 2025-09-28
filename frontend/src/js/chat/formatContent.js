var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { preloadImg } from "./loadAndUpdateDOM.js";
export function soundNotification() {
    const audio = new Audio("../../sounds/notification.mp3");
    audio.volume = 0.3;
    audio.play().catch(error => {
        console.error("Error playing notification sound:", error);
    });
}
function formatTextToHtml(text) {
    let htmlText = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    htmlText = htmlText.replace(/\n/g, "<br>");
    htmlText = htmlText.replace(/  /g, " &nbsp;");
    return htmlText;
}
export function formatMsgTemplate(data, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        let htmlContent;
        if (data.userId.toString() === userId.toString()) {
            htmlContent = yield fetch("../../html/chat/msgTemplateUser.html");
        }
        else {
            htmlContent = yield fetch("../../html/chat/msgTemplatePartner.html");
        }
        let htmlText = yield htmlContent.text();
        const message = formatTextToHtml(data.message.toString());
        const imagePath = `${data.imagePath}?t=${Date.now()}`;
        htmlText = htmlText
            .replace("{{ username }}", data.username.toString())
            .replace("{{ timeStamp }}", data.timeStamp.toString())
            .replace("{{ message }}", message)
            .replace("{{ imagePath }}", imagePath)
            .replace("{{ usernameImage }}", data.username.toString());
        yield preloadImg(imagePath);
        return htmlText;
    });
}
export function formatRecentChatTemplate(data, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const chats = sessionStorage.getItem("recent-chats") || "";
        const currentRoom = sessionStorage.getItem("current-room") || "";
        const container = document.createElement('div');
        container.innerHTML = chats;
        const roomId = data.roomId;
        const existingChat = container.querySelector(`#chat-item-${roomId}`);
        const username = (userId === data.userId ? data.partnerUsername : data.username).toString();
        const imagePath = (userId === data.userId ? data.partnerImagePath : data.imagePath).toString();
        if (existingChat) {
            const messageDiv = existingChat.querySelector(".text-gray-400");
            if (messageDiv) {
                messageDiv.textContent = data.message;
            }
            const timeDiv = existingChat.querySelector(".text-gray-500");
            if (timeDiv) {
                timeDiv.textContent = data.timeStamp;
            }
            const usernameDiv = existingChat.querySelector(".text-white");
            if (usernameDiv) {
                usernameDiv.textContent = username;
            }
            const avatarImg = existingChat.querySelector("img");
            if (avatarImg) {
                const imagePathPreloaded = `${imagePath}?t=${Date.now()}`;
                avatarImg.src = imagePathPreloaded;
                yield preloadImg(imagePathPreloaded);
            }
            if (userId !== data.userId && currentRoom !== roomId) {
                existingChat.classList.add('animate-flash-bg');
            }
            if (container.firstElementChild !== existingChat) {
                container.removeChild(existingChat);
                container.insertBefore(existingChat, container.firstChild);
            }
        }
        else {
            const imagePathPreloaded = `${imagePath}?t=${Date.now()}`;
            const htmlContent = yield fetch("../../html/chat/recentChatItem.html");
            let htmlText = yield htmlContent.text();
            htmlText = htmlText
                .replace("{{ roomId }}", roomId)
                .replace("{{ username }}", username)
                .replace("{{ imagePath }}", imagePathPreloaded)
                .replace("{{ usernameImage }}", username)
                .replace("{{ lastLine }}", data.message.toString())
                .replace("{{ timeStamp }}", data.timeStamp.toString());
            yield preloadImg(imagePathPreloaded);
            const tmp = document.createElement("div");
            tmp.innerHTML = htmlText;
            const newChatItem = tmp.firstElementChild;
            if (newChatItem) {
                if (currentRoom !== roomId && userId !== data.userId) {
                    newChatItem.classList.add('animate-flash-bg');
                }
                container.insertBefore(newChatItem, container.firstChild);
            }
        }
        return container.innerHTML || "";
    });
}
export function formatConnectedUsersTemplate(data) {
    return __awaiter(this, void 0, void 0, function* () {
        let htmlText = '';
        let htmlContent;
        let userHtmlContent;
        let imagePath = "";
        const usersConnected = Object.values(data.object);
        for (const user of usersConnected) {
            imagePath = `${user.imagePath}?t=${Date.now()}`;
            userHtmlContent = yield fetch("../../html/chat/userListItem.html");
            htmlContent = yield userHtmlContent.text();
            htmlContent = htmlContent
                .replace("{{ userId }}", user.userId.toString())
                .replace("{{ id }}", user.userId.toString())
                .replace("{{ username }}", user.username.toString())
                .replace("{{ usernameImage }}", user.username.toString())
                .replace("{{ imagePath }}", imagePath)
                .replace("{{ bgcolor }}", user.status.toString())
                .replace("{{ bcolor }}", user.status.toString());
            yield preloadImg(imagePath);
            htmlText += htmlContent;
        }
        return htmlText;
    });
}
export function sortUsersAlphabetically(htmlContent) {
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
            target.classList.add('border-t', 'border-t-chilean-fire-500');
        }
    }
    const sortedHtml = items.map(item => item.outerHTML).join('');
    return sortedHtml;
}
export function formatUserInfo(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const usersConnected = JSON.parse(sessionStorage.getItem("JSONusers") || "{}");
        const user = usersConnected.object.find((user) => user.userId === data.partnerId) || {};
        const color = user.status;
        const imagePath = `${data.partnerImagePath}?t=${Date.now()}`;
        sessionStorage.setItem("current-room", data.roomId);
        const htmlContent = yield fetch("../../html/chat/userInfo.html");
        let htmlText = yield htmlContent.text();
        htmlText = htmlText
            .replace("{{ username }}", data.partnerUsername.toString())
            .replace("{{ usernameImage }}", data.partnerUsername.toString())
            .replace("{{ imagePath }}", imagePath)
            .replace("{{ bgcolor }}", color)
            .replace("{{ bcolor }}", color)
            .replace("{{ gcolor }}", color);
        yield preloadImg(imagePath);
        return htmlText;
    });
}
