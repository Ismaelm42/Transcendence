import { Step } from './stepRender.js';
import { getTimeStamp, handleChat } from './handleChat.js';

async function initWebsocket(): Promise<WebSocket> {
	const socket = new WebSocket("https://localhost:8443/back/chat");
	socket.onopen = () => {
		console.log("New client connected");
	};
	socket.onmessage = (event) => {
		console.log("Client message:", event.data);
	};
	socket.onclose = (event: CloseEvent) => {
		console.log(`Client connection closed - Code: ${event.code}, Reason: ${event.reason}`);
	};
	socket.onerror = (event) => {
		console.error("Websocket error:", event);
	};
	return socket;
}


async function formatMessage(imagePath:string , username:string, message:string, messageStatus:string): Promise<string> {
	const response = await fetch("../html/chat.html");
	if (!response.ok) {
		throw new Error("Failed to load the HTML file");
	}
	let htmlContent = await response.text();
	htmlContent = htmlContent
	.replace("{{ image }}", imagePath)
	.replace("{{ usernameImage }}", username ? username : "Guest")
	.replace("{{ username }}", username ? username : "Guest")
	.replace("{{ timeStamp }}", getTimeStamp())
	.replace("{{ message }}", message)
	.replace("{{ messageStatus }}", messageStatus);
	return htmlContent;
}




export default class Chat extends Step {
	async render(appElement: HTMLElement): Promise<void> {
		if (!this.username) {
			this.username = await this.checkAuth();
		}
		try {
			
			const socket = await initWebsocket();
			const htmlContent = await formatMessage("https://localhost:8443/back/images/default-avatar.png", "Ismael", "Hello, world!", "sent");
			appElement.innerHTML = htmlContent;
			handleChat();
		}
		catch (error) {
				appElement.innerHTML = `<div id="pong-container">An error occurred while generating the content</div>`;
			}
		}
}
