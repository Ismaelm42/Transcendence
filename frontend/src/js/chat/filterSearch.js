import { setInputKeyword, htmlUsersConnected } from "./state.js";
export function filterSearchUsers(keyword) {
    setInputKeyword(keyword);
    const itemsContainer = document.getElementById("user-item-container");
    if (!itemsContainer)
        return;
    // si keyword vacío, restaurar lista completa
    if (!keyword || keyword.trim() === "") {
        itemsContainer.innerHTML = htmlUsersConnected;
        const searchInput = document.querySelector("#search-users-input, #user-search-input, input[data-role='user-search']");
        if (searchInput)
            searchInput.value = "";
        return;
    }
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = htmlUsersConnected;
    const userElements = Array.from(tempContainer.querySelectorAll(".item"));
    const filteredUsers = userElements.filter(userElement => {
        var _a, _b;
        const username = ((_b = (_a = userElement.querySelector("span.text-sm")) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim().toLowerCase()) || "";
        return username.includes(keyword.toLowerCase());
    });
    itemsContainer.innerHTML = "";
    if (filteredUsers.length > 0) {
        filteredUsers.forEach(userElement => {
            // clonar para no mover nodos fuente
            itemsContainer.appendChild(userElement.cloneNode(true));
        });
    }
    else {
        itemsContainer.innerHTML = `<div class="text-sm text-gray-500 py-2">No users found</div>`;
    }
}
// función pública para limpiar desde el router/SPA
export function clearSearchFilter() {
    setInputKeyword("");
    const itemsContainer = document.getElementById("user-item-container");
    if (itemsContainer)
        itemsContainer.innerHTML = htmlUsersConnected;
    const searchInput = document.querySelector("#search-users-input, #user-search-input, input[data-role='user-search']");
    if (searchInput)
        searchInput.value = "";
}
