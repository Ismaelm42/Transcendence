import { setInputKeyword, htmlUsersConnected } from "./state.js";
export function filterSearchUsers(keyword) {
    setInputKeyword(keyword);
    const itemsContainer = document.getElementById("user-item-container");
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = htmlUsersConnected;
    const userElements = Array.from(tempContainer.querySelectorAll(".item"));
    const filteredUsers = userElements.filter(userElement => {
        var _a, _b;
        const username = ((_b = (_a = userElement.querySelector("span.text-sm")) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim().toLowerCase()) || "";
        return username.includes(keyword.toLowerCase());
    });
    if (itemsContainer) {
        itemsContainer.innerHTML = "";
        if (filteredUsers.length > 0) {
            filteredUsers.forEach(userElement => {
                itemsContainer.appendChild(userElement);
            });
        }
    }
}
