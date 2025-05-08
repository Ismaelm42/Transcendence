import { Step } from './stepRender.js';

function getTimeStamp(): string {
	const now = new Date();
	const hours = now.getHours().toString().padStart(2, '0');
	const minutes = now.getMinutes().toString().padStart(2, '0');
	return `${hours}:${minutes}`;
}



async function formatMessage(imagePath:string, username:string, message:string, messageStatus:string): Promise<string> {
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





async function initWebsocket(): Promise<WebSocket> {
	const socket = new WebSocket("wss://localhost:8443/back/chat");
	socket.onopen = () => {
		console.log("NEW CLIENT CONNECTED");
	};
	socket.onmessage = (event) => {
		console.log("CLIENT MESSAGE:", event.data);
	};
	socket.onclose = (event: CloseEvent) => {
		console.log(`CLIENT CONNECTION CLOSED - Code: ${event.code}, Reason: ${event.reason}`);
	};
	socket.onerror = (event) => {
		console.error("WEBSOCKET ERROR:", event);
	};
	return socket;
}

export default class Chat extends Step {
	async render(appElement: HTMLElement): Promise<void> {
		if (!this.username) {
			this.username = await this.checkAuth();
		}
		try {
			const socket = new WebSocket("https://localhost:8443/back/ws/chat");
			socket.onopen = () => {
				console.log("CLIENT: Connected to Websocket-server");
				socket.send("Hi server!");
			};
			socket.onmessage = (event) => {
				console.log("CLIENT: Message from server:", event.data);
			};
			socket.onclose = (event: CloseEvent) => {
				console.log(`CLIENT: Connection closed - Code: ${event.code}, Reason: ${event.reason}`);
			};
			socket.onerror = (event) => {
				console.error("CLIENT: WebSocket error:", event);
			};
			const htmlContent = await formatMessage("https://localhost:8443/back/images/default-avatar.png", "Ismael", "Hey, how are you? Is everything fine! I'm testing this with a very very very very very very very very very very very long message.", "sent");
			appElement.innerHTML = htmlContent;
			const form = document.getElementById("chat-form") as HTMLFormElement;
			const textarea = document.getElementById("chat-textarea") as HTMLTextAreaElement;
			textarea.addEventListener('keydown', (e) => {
				if (e.key === 'Enter' && !e.shiftKey) {
					e.preventDefault();
					form.requestSubmit();
				}
			});
			form.addEventListener('submit', (e) => {
				e.preventDefault();
				const message = textarea.value.trim();
				if (message) {
					socket.send(message);
					textarea.value = '';
				}
			});
		}
		catch (error) {
				appElement.innerHTML = `<div id="pong-container">An error occurred while generating the content</div>`;
			}
		}
}
