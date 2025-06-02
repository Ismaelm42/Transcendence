var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function formatMsgTemplate(data, name) {
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
export function formatConnectedUsersTemplate(data) {
    return __awaiter(this, void 0, void 0, function* () {
        let htmlText = '';
        let htmlContent;
        let userHtmlContent;
        const usersConnected = Object.values(data.object);
        for (const user of usersConnected) {
            userHtmlContent = yield fetch("../../html/chat/userListItem.html");
            htmlContent = yield userHtmlContent.text();
            htmlContent = htmlContent
                .replace("{{ userId }}", user.id.toString())
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
            target.classList.add("border-t");
        }
    }
    const sortedHtml = items.map(item => item.outerHTML).join('');
    return sortedHtml;
}
export function formatUserInfo(data, name) {
    return __awaiter(this, void 0, void 0, function* () {
        const usersConnected = JSON.parse(sessionStorage.getItem("JSONusers") || "{}");
        const user = usersConnected.object.find((user) => user.username === data.partnerUsername) || {};
        const color = user.status || "gray";
        sessionStorage.setItem("current-room", data.roomId);
        const htmlContent = yield fetch("../../html/chat/userInfo.html");
        let htmlText = yield htmlContent.text();
        htmlText = htmlText
            .replace("{{ username }}", data.partnerUsername.toString())
            .replace("{{ usernameImage }}", data.partnerUsername.toString())
            .replace("{{ imagePath }}", data.partnerImagePath.toString())
            .replace("{{ bgcolor }}", color)
            .replace("{{ bcolor }}", color)
            .replace("{{ gcolor }}", color);
        return htmlText;
    });
}
