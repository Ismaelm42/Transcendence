import { formatUserInfo } from "./formatContent.js";

export function updatePartnerStatus() {
	
	const data = JSON.parse(sessionStorage.getItem("JSONdata") || "{}");
	const usersConnected = JSON.parse(sessionStorage.getItem("JSONusers") || "{}");
	const user = usersConnected.object.find((user: any) => user.userId === data.partnerId) || {};
	const baseColor = user.status || "slate";
	const bgCode = baseColor === "slate" ? "700" : "500";
	const bgColor = `${baseColor}-${bgCode}`;

	const span = document.querySelector('#user-info span');
	if (span) {
		let classes = span.className;
		classes = classes
			.replace(/bg-[\w-]+/, `bg-${bgColor}`)
			.replace(/border-[\w-]+-50/, `border-${baseColor}-50`)
			.replace(/glow-[\w-]+/, `glow-${baseColor}`);
		span.className = classes;
	}
}

export async function handleUserInfo(chatMessages: HTMLDivElement, data:any, userId: string) {

	if (userId === data.userId) {
		const UserInfo = document.getElementById("user-info-container") as HTMLDivElement;
		UserInfo.innerHTML = await formatUserInfo(data);

		const privateChat = JSON.parse(sessionStorage.getItem("private-chat") || "{}") as Record<string, string>;
		const stored = privateChat[data.roomId] || "";
		chatMessages.innerHTML = stored || "";
		// Scroll to the bottom of the chat messages BUT it should be done after the content is read by the user.
		requestAnimationFrame(() => {
			chatMessages.scrollTop = chatMessages.scrollHeight;
		});

		const button = UserInfo.querySelector("#back-group-chat") as HTMLButtonElement;
		button.addEventListener('click', (e) => {
			e.preventDefault();
			sessionStorage.setItem("current-room", "");
			const stored = sessionStorage.getItem("public-chat") || "";
			UserInfo.innerHTML = "";
			chatMessages.innerHTML = stored;
			requestAnimationFrame(() => {
				chatMessages.scrollTop = chatMessages.scrollHeight;
			});
		});
	}
}
