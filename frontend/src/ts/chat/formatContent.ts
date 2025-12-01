import { preloadImg } from "./loadAndUpdateDOM.js";

export function soundNotification() {
	const audio = new Audio("../../sounds/notification.mp3");
	audio.volume = 0.3;
	audio.play().catch(error => {
		console.error("Error playing notification sound:", error);
	});
}

function formatTextToHtml(text: string) {

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

export async function formatMsgTemplate(data: any, userId: string): Promise<string> {

	let htmlContent;
	if (data.userId.toString() === userId.toString()) {
		htmlContent = await fetch("../../html/chat/msgTemplateUser.html");
	}
	else {
		htmlContent = await fetch("../../html/chat/msgTemplatePartner.html");
	}
	let htmlText = await htmlContent.text();
	let message = formatTextToHtml(data.message.toString());

	if (data.message.toString().startsWith("$$INVITE$$:")) {
		const gameId = data.message.toString().split(":")[1];
		if (data.userId.toString() === userId.toString()) {
			// Enviado por mí (solo aviso)
			message = `
                <div class="invite-card p-3 md:p-4 bg-gray-900/60 rounded-lg border border-chilean-fire-500/40 shadow-sm backdrop-blur">
                    <p class="text-international-orange-400 font-semibold mb-1">Invitation sent</p>
                </div>
            `;
		} else {
			// Recibido (mostrar aceptar / rechazar)
			message = `
                <div class="invite-card p-3 md:p-4 bg-gray-900/60 rounded-lg border border-chilean-fire-500/40 shadow-sm backdrop-blur">
                    <div class="flex items-center justify-between gap-3">
                        <div class="min-w-0">
                            <p class="text-international-orange-400 font-semibold">Game invite</p>
                        </div>
                        <div class="flex gap-2 shrink-0">
                            <button
                                class="btn-pong-primary px-3 py-1.5 rounded-md text-sm font-semibold"
                                data-action="accept-invite"
                                data-game-id="${gameId}">
                                Accept
                            </button>
                            <button
                                class="px-3 py-1.5 rounded-md text-sm font-semibold border border-international-orange-400 text-international-orange-400 hover:bg-international-orange-500/10 transition"
                                data-action="ignore-invite"
                                data-game-id="${gameId}">
                                Decline
                            </button>
                        </div>
                    </div>
                </div>
            `;
		}
	}

	const imagePath = `${data.imagePath}?t=${Date.now()}`;
	htmlText = htmlText
		.replace("{{ username }}", data.username.toString())
		.replace("{{ timeStamp }}", data.timeStamp.toString())
		.replace("{{ message }}", message)
		.replace("{{ imagePath }}", imagePath)
		.replace("{{ usernameImage }}", data.username.toString());
	await preloadImg(imagePath);
	return htmlText;
}

export async function formatRecentChatTemplate(data: any, userId: string): Promise<string> {

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
			messageDiv!.textContent = data.message;
		}
		const timeDiv = existingChat.querySelector(".text-gray-500");
		if (timeDiv) {
			timeDiv!.textContent = data.timeStamp;
		}
		const usernameDiv = existingChat.querySelector(".text-white");
		if (usernameDiv) {
			usernameDiv.textContent = username;
		}	
		const avatarImg = existingChat.querySelector("img");
		if (avatarImg) {
			const imagePathPreloaded = `${imagePath}?t=${Date.now()}`;
			(avatarImg as HTMLImageElement).src = imagePathPreloaded;
			await preloadImg(imagePathPreloaded);
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
		const htmlContent = await fetch("../../html/chat/recentChatItem.html");
		let htmlText = await htmlContent.text();
		htmlText = htmlText
			.replace("{{ roomId }}", roomId)
			.replace("{{ username }}", username)
			.replace("{{ imagePath }}", imagePathPreloaded)
			.replace("{{ usernameImage }}", username)
			.replace("{{ lastLine }}", data.message.toString())
			.replace("{{ timeStamp }}", data.timeStamp.toString());
		await preloadImg(imagePathPreloaded);
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
}

export async function formatConnectedUsersTemplate(data: any): Promise<string> {

	let htmlText = '';
	let htmlContent;
	let userHtmlContent;
	let imagePath = "";
	const usersConnected = Object.values(data.object) as { userId: string; username: string; imagePath: string; status: string }[];

	for (const user of usersConnected) {
		imagePath = `${user.imagePath}?t=${Date.now()}`
		userHtmlContent = await fetch("../../html/chat/userListItem.html");
		htmlContent = await userHtmlContent.text();
		htmlContent = htmlContent
			.replace("{{ userId }}", user.userId.toString())
			.replace("{{ id }}", user.userId.toString())
			.replace("{{ username }}", user.username.toString())
			.replace("{{ usernameImage }}", user.username.toString())
			.replace("{{ imagePath }}", imagePath)
			.replace("{{ bgcolor }}", user.status.toString())
			.replace("{{ bcolor }}", user.status.toString())
		await preloadImg(imagePath);
		htmlText += htmlContent;
	}
	return htmlText;
}

export function sortUsersAlphabetically(htmlContent: string): string {

	const container = document.createElement('div');
	container.innerHTML = htmlContent;
	const items = Array.from(container.querySelectorAll('.item'));

	items.sort((a, b) => {
		const usernameA = a.querySelector('span.text-sm')?.textContent?.trim().toLowerCase() || '';
		const usernameB = b.querySelector('span.text-sm')?.textContent?.trim().toLowerCase() || '';
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

export async function formatUserInfo(data:any): Promise<string> {

	const usersConnected = JSON.parse(sessionStorage.getItem("JSONusers") || "{}");
	const user = usersConnected.object.find((user: any) => user.userId === data.partnerId) || {};
	const color = user.status;
	const imagePath = `${data.partnerImagePath}?t=${Date.now()}`;
	sessionStorage.setItem("current-room", data.roomId);
	const htmlContent = await fetch("../../html/chat/userInfo.html");
	let htmlText = await htmlContent.text();
	htmlText = htmlText
		.replace("{{ username }}", data.partnerUsername.toString())
		.replace("{{ usernameImage }}", data.partnerUsername.toString())
		.replace("{{ imagePath }}", imagePath)
		.replace("{{ bgcolor }}", color)
		.replace("{{ bcolor }}", color)
		.replace("{{ gcolor }}", color);
	await preloadImg(imagePath);
	return htmlText;
}
