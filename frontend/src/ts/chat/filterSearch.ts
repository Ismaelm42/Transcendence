import { setInputKeyword, htmlUsersConnected } from "./state.js";

export function filterSearchUsers(keyword: string) {

	setInputKeyword(keyword)
	const itemsContainer = document.getElementById("user-item-container") as HTMLDivElement;
	const tempContainer = document.createElement("div");
	tempContainer.innerHTML = htmlUsersConnected;
	const userElements = Array.from(tempContainer.querySelectorAll(".item")) as HTMLDivElement[];
	const filteredUsers = userElements.filter(userElement => {
		const username = userElement.querySelector("span.text-sm")?.textContent?.trim().toLowerCase() || "";
		return username.includes(keyword.toLowerCase());
	});
	if (itemsContainer)
	{
		itemsContainer.innerHTML = "";
		if (filteredUsers.length > 0) {
			filteredUsers.forEach(userElement => {
				itemsContainer.appendChild(userElement);
			});
		}
	}
}
