export let onlineSocket: WebSocket | null = null;

export function initOnlineSocket() {
	if (!onlineSocket || onlineSocket.readyState === WebSocket.CLOSED) {
		onlineSocket = new WebSocket("wss://localhost:8443/back/ws/online");
		
		onlineSocket.onopen = () => {
		};

		onlineSocket.onmessage = (event) => {
			const data = JSON.parse(event.data);
			if (data.type === "onlineUsers") {
				sessionStorage.setItem("userConnected", JSON.stringify(data.users));
				window.dispatchEvent(new Event("onlineUsersUpdated"));
			}
			else if (data.type === "refreshRelations") {
				window.dispatchEvent(new Event("onlineUsersUpdated"));
			}
		};

		onlineSocket.onclose = () => {
			onlineSocket = null;
		};

		onlineSocket.onerror = (err) => {
		};
	}
}

export function closeOnlineSocket() {
	if (onlineSocket) {
		onlineSocket.close();
		onlineSocket = null;
	}
}
