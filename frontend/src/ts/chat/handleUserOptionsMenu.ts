import { handlePrivateMsg } from "./handleSenders.js";
import { showUserProfile } from "./handleUserProfile.js";
import {openPrivateChat} from "./userProfileActions.js";

export function showUserOptionsMenu(userElement: HTMLDivElement, event: MouseEvent, socket: WebSocket, currentUserId: string) {
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

	addMenuOptionsListeners(menu, userId, username, event, socket, currentUserId);

	menu.addEventListener("mouseleave", () => {
		menu.remove();
	});
	const handleClickOutside = (e: MouseEvent) => {
		if (!menu.contains(e.target as Node)) {
			menu.remove();
			document.removeEventListener("click", handleClickOutside);
		}
	};
	setTimeout(() => {
		document.addEventListener("mousedown", handleClickOutside);
	}, 0);
	event.stopPropagation();
}

function createOptionMenu(event: MouseEvent, userElement: HTMLElement): HTMLDivElement {
	const menu = document.createElement("div");
	menu.id = "user-options-menu";
	menu.className = "absolute bg-pong-primary/95 border border-candlelight-400   rounded-xl shadow-2xl p-2 z-50";
	menu.innerHTML = `
		<div class="flex items-center gap-4 text-gray-300 cursor-pointer hover:bg-candlelight-400 hover:text-pong-text-reverse transition-colors duration-400 p-2 rounded" data-action="msg"> <svg width="25" height="25" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 16 16">
  		<rect x="2" y="4" width="12" height="8" rx="2"/>
  		<path d="M2.5 4.5L8 9l5.5-4.5"/>
		</svg> Private Message</div>
		<div class="flex items-center gap-4 text-gray-300 cursor-pointer hover:bg-chilean-fire-500 hover:text-pong-text-reverse transition-colors duration-400 p-2 rounded" data-action="play-game"><svg width="25" height="25" fill="currentColor" viewBox="0 0 16 16">
  		<polygon points="5,3 13,8 5,13"/>
		</svg> Play Game</div>
		<div class="flex items-center gap-4 text-gray-300 cursor-pointer hover:bg-international-orange-700 hover:text-pong-text-secondary transition-colors duration-400 p-2 rounded" data-action="show-more"> <svg width="25" height="25" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 16 16">
  		<circle cx="8" cy="6" r="3"/>
  		<path d="M3 13c0-2.2 2.2-4 5-4s5 1.8 5 4"/>
		</svg> Show Profile</div>
	`;
	const rect = userElement.getBoundingClientRect();

	// Calcula la posición: debajo del usuario, alineado horizontalmente con el click, pero no fuera del usuario
	let left = event.clientX;//el event clientX es la posición del click
	let top = rect.top + rect.height + window.scrollY - 10; // Ajusta la posición vertical para que esté debajo del usuario

	// Limita el menú para que no se salga de la pantalla
	document.body.appendChild(menu);

	const viewportWidth = window.innerWidth;// Ancho de la ventana
	const viewportHeight = window.innerHeight;// Alto de la ventana

	if (left + rect.width > viewportWidth) {
		left = viewportWidth - rect.width - 10; // Ajusta hacia la izquierda si se sale del viewport
	}

	if (top + rect.height > viewportHeight) {
		top = rect.top + window.scrollY - rect.height - 10; // Ajusta hacia arriba
	}
	menu.style.top = `${top}px`;
	menu.style.left = `${left}px`;
	return menu;
}

function addMenuOptionsListeners(menu: HTMLDivElement, userId: string, username: string, event: MouseEvent, socket: WebSocket, currentUserId: string) {
	menu.querySelectorAll("div").forEach((option) => {
		option.addEventListener("click", () => {
			const action = option.getAttribute("data-action");
			if (action) {
				switch (action) {
					case "msg":
						handlePrivateMsg(event, socket);
						break;
					case "play-game":
						alert("Feature not implemented yet: Play Game with " + username);
					case "show-more":
						showUserProfile(currentUserId, userId, username, event);
						break;
				}
			}
			menu.remove();
		});
	});
}
