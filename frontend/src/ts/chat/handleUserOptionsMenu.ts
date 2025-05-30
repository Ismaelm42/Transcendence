import { handlePrivateMsg } from "./handleSenders.js";
import { showUserProfile } from "./handleUserProfile.js";
import {openPrivateChat} from "./userProfileActions.js";

export function showUserOptionsMenu(userElement: HTMLDivElement, event: MouseEvent) {
	const username = userElement.querySelector("span.text-sm")?.textContent?.trim();
	if (!username) return;

	const userId = userElement.id.replace("item-", "");
	if (!userId) return;

	const oldMenu = document.getElementById("user-options-menu");
	if (oldMenu) {
		oldMenu.remove();
	}
	const menu = createOptionMenu(event, userElement);

	document.body.appendChild(menu);

	addMenuOptionsListeners(menu, userId, username, event);

	menu.addEventListener("mouseleave", () => {
		menu.remove();
	});
	event.stopPropagation();
}

function createOptionMenu(event: MouseEvent, userElement: HTMLElement): HTMLDivElement {
	const menu = document.createElement("div");
	menu.id = "user-options-menu";
	menu.className = "absolute bg-gray-900/95 border border-slate-200 rounded-xl shadow-2xl p-2 z-50";
	menu.innerHTML = `
		<div class="text-gray-300 cursor-pointer hover:bg-sky-700/80 p-2 rounded" data-action="msg"> • Private Message</div>
		<div class="text-gray-300 cursor-pointer hover:bg-sky-700/80 p-2 rounded" data-action="play-game"> ▶ Play Game</div>
		<div class="text-gray-300 cursor-pointer hover:bg-sky-700/80 p-2 rounded" data-action="show-more"> ≡ Show More</div>
	`;
	const rect = userElement.getBoundingClientRect();

	// Calcula la posición: debajo del usuario, alineado horizontalmente con el click, pero no fuera del usuario
	let left = event.clientX - 10;
	let top = rect.top + rect.height + window.scrollY - 10

	// Limita el menú para que no se salga de la pantalla
	document.body.appendChild(menu);
	const menuRect = menu.getBoundingClientRect();
	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;

	// Si el click está fuera del usuario, centra el menú respecto al usuario
	if (event.clientX < rect.left || event.clientX > rect.right) {
		left = rect.left + rect.width / 2 - menuRect.width / 2 + window.scrollX;
	}

	// Ajusta si se sale por la derecha
	if (left + menuRect.width > viewportWidth) {
		left = viewportWidth - menuRect.width - 10;
	}
	// Ajusta si se sale por la izquierda
	if (left < 10) {
		left = 10;
	}
	// Ajusta si se sale por abajo
	if (top + menuRect.height > viewportHeight) {
		top = viewportHeight - menuRect.height - 10;
	}
	// Nunca menos de 0
	top = Math.max(top, 10);

	menu.style.top = `${top}px`;
	menu.style.left = `${left}px`;
	return menu;
}

function addMenuOptionsListeners(menu: HTMLDivElement, userId: string, username: string, event: MouseEvent) {
	menu.querySelectorAll("div").forEach((option) => {
		option.addEventListener("click", () => {
			const action = option.getAttribute("data-action");
			if (action) {
				switch (action) {
					case "msg":
						openPrivateChat(username);
						break;
					case "play-game":
						alert("Feature not implemented yet: Play Game with " + username);
					case "show-more":
						showUserProfile(userId, username, event);
						break;
				}
			}
			menu.remove();
		});
	});
}
