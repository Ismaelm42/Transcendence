import { formatLobbyList } from "./formatContent.js";
import { sendOptionSelected } from "./handleSenders.js";

export async function updateLobbyList(data: any) {

	const lobby = document.getElementById('games-list-container') as HTMLDivElement;
	if (lobby) {
		const Lobbies = await formatLobbyList(data);
		lobby.innerHTML = Lobbies;
		
		const optionButtons = lobby.querySelectorAll('button');
		
		optionButtons.forEach(button => {
			button.addEventListener('click', (e) => {
				const target = e.target as HTMLButtonElement;
				const itemWrapper = target.closest('.item-wrapper') as HTMLDivElement;
				const id = itemWrapper.dataset.id;
				if (id)
					sendOptionSelected(id);
			});
		});
	}
}
