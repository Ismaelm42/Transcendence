import { setInputKeyword, htmlUsersConnected } from "./state.js";

export function filterSearchUsers(keyword: string) {
	setInputKeyword(keyword);

	const itemsContainer = document.getElementById("user-item-container") as HTMLDivElement | null;
	if (!itemsContainer) return;

	// si keyword vacío, restaurar lista completa
	if (!keyword || keyword.trim() === "") {
		itemsContainer.innerHTML = htmlUsersConnected;
		const searchInput = document.querySelector<HTMLInputElement>("#search-users-input, #user-search-input, input[data-role='user-search']");
		if (searchInput) searchInput.value = "";
		return;
	}

	const tempContainer = document.createElement("div");
	tempContainer.innerHTML = htmlUsersConnected;
	const userElements = Array.from(tempContainer.querySelectorAll(".item")) as HTMLDivElement[];

	const filteredUsers = userElements.filter(userElement => {
		const username = userElement.querySelector("span.text-sm")?.textContent?.trim().toLowerCase() || "";
		return username.includes(keyword.toLowerCase());
	});

	itemsContainer.innerHTML = "";
	if (filteredUsers.length > 0) {
		filteredUsers.forEach(userElement => {
			// clonar para no mover nodos fuente
			itemsContainer.appendChild(userElement.cloneNode(true) as HTMLElement);
		});
	} else {
		itemsContainer.innerHTML = `<div class="text-sm text-gray-500 py-2">No users found</div>`;
	}
}

// función pública para limpiar desde el router/SPA
export function clearSearchFilter(): void {
	setInputKeyword("");
	const itemsContainer = document.getElementById("user-item-container") as HTMLDivElement | null;
	if (itemsContainer) itemsContainer.innerHTML = htmlUsersConnected;
	const searchInput = document.querySelector<HTMLInputElement>("#search-users-input, #user-search-input, input[data-role='user-search']");
	if (searchInput) searchInput.value = "";
}

