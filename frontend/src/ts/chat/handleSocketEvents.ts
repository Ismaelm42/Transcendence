import { filterSearchUsers } from "./filterSearch.js";
import { removeNotificationAndUpdateHTML } from "./loadAndUpdateDOM.js";
import { handleUserInfo, updatePartnerStatus } from "./handleUserInfo.js";
import { inputKeyword, setHtmlUsersConnected } from "./state.js";
import { soundNotification, formatMsgTemplate, formatRecentChatTemplate, formatConnectedUsersTemplate, sortUsersAlphabetically } from "./formatContent.js";

function handleSocketOpen(socket: WebSocket) {
	socket.onopen = () => {
		const handshake = {
			type: 'handshake',
			message: ''
		};
		socket.send(JSON.stringify(handshake));
	}
}

async function handlePublicChatMsg(chatMessages: HTMLDivElement, data: any, userId: string) {

	const HtmlContent = await formatMsgTemplate(data, userId);
	let stored = sessionStorage.getItem("public-chat") || "";
	stored += HtmlContent;
	sessionStorage.setItem("public-chat", stored);
	if (sessionStorage.getItem("current-room") === "") {
		chatMessages.innerHTML = stored || "";
		chatMessages.scrollTop = chatMessages.scrollHeight;
	}
}

async function handlePrivateChatMsg(chatMessages: HTMLDivElement, recentChats: HTMLDivElement, data: any, userId: string) {

	if (userId === data.partnerId && (sessionStorage.getItem("current-room") !== data.roomId || sessionStorage.getItem("current-view") !== "Chat")) {
		soundNotification();
	}
	if (userId === data.partnerId && sessionStorage.getItem("current-view") !== "Chat") {
		const chatTab = document.querySelector('a[href="#chat"]');
		chatTab?.classList.add('blink');	
	}
	const HtmlContent = await formatMsgTemplate(data, userId);
	const HtmlChat= await formatRecentChatTemplate(data, userId);
	recentChats.innerHTML = HtmlChat || "";
	sessionStorage.setItem("recent-chats", HtmlChat || "");
	const privateChat = JSON.parse(sessionStorage.getItem("private-chat") || "{}");
	let stored = privateChat[data.roomId] || "";
	stored += HtmlContent || "";
	privateChat[data.roomId] = stored || "";
	sessionStorage.setItem("private-chat", JSON.stringify(privateChat));
	if (sessionStorage.getItem("current-room") === data.roomId) {
		chatMessages.innerHTML = stored || "";
		chatMessages.scrollTop = chatMessages.scrollHeight;
	}
}

async function handleConnectedUsers(data: any) {

	let HtmlContent = await formatConnectedUsersTemplate(data);
	HtmlContent = sortUsersAlphabetically(HtmlContent);
	setHtmlUsersConnected(HtmlContent);
	filterSearchUsers(inputKeyword);
}

function handleSocketMessage(socket: WebSocket, chatMessages: HTMLDivElement, recentChats: HTMLDivElement, userId: string) {

	socket.onmessage = async (event: MessageEvent) => {
		const data = JSON.parse(event.data);
		if (data.type === 'message') {
			sessionStorage.setItem("JSONdata", JSON.stringify(data));
			handlePublicChatMsg(chatMessages, data, userId);
		}
		if (data.type === 'private') {
			removeNotificationAndUpdateHTML(data.roomId);
			if (userId === data.userId) {
				sessionStorage.setItem("JSONdata", JSON.stringify(data));
			}
			if (data.message && data.message.toString().startsWith("$$INVITE$$:") && userId === data.userId) {
				handleUserInfo(chatMessages, data, userId);
				return;
			}
			if (!data.message) {
				handleUserInfo(chatMessages, data, userId);
			}
			else {
				handleUserInfo(chatMessages, data, userId);
				handlePrivateChatMsg(chatMessages, recentChats, data, userId)
			}
		}
		if (data.type === 'connectedUsers') {
			sessionStorage.setItem("JSONusers", JSON.stringify(data));
			handleConnectedUsers(data);
			if (sessionStorage.getItem("current-room") !== "") {
				updatePartnerStatus();
			}
		}
	}
}

function handleSocketClose(socket: WebSocket) {
	socket.onclose = (event: CloseEvent) => {
	}
}

function handleSocketError(socket: WebSocket) {
	socket.onerror = (event) => {
	}
}

export function handleSocketEvents(socket: WebSocket, chatMessages: HTMLDivElement, recentChats: HTMLDivElement, userId: string): WebSocket {

	handleSocketOpen(socket);
	handleSocketMessage(socket, chatMessages, recentChats, userId);
	handleSocketClose(socket);
	handleSocketError(socket);
	return socket;
}
