export let onlineSocket: WebSocket | null = null;

export function initOnlineSocket() {
	if (!onlineSocket || onlineSocket.readyState === WebSocket.CLOSED) {
		onlineSocket = new WebSocket("wss://localhost:8443/back/ws/online");
		console.log("Online socket initialized");
		
		onlineSocket.onopen = () => {
			console.log("Online socket connection established");
		};

		onlineSocket.onmessage = (event) => {
			const data = JSON.parse(event.data);
			if (data.type === "onlineUsers") {
				console.log("Usuarios online recibidos:", data.users);
				sessionStorage.setItem("userConnected", JSON.stringify(data.users));
				window.dispatchEvent(new Event("onlineUsersUpdated"));
			}
			else if (data.type === "refreshRelations") {
				console.log("Refresh relations event received");
				window.dispatchEvent(new Event("onlineUsersUpdated"));
			}
		};

		onlineSocket.onclose = () => {
			console.log("Online socket closed");
			onlineSocket = null;
		};

		onlineSocket.onerror = (err) => {
			console.error("Error en el WebSocket de usuarios online:", err);
		};
	}
}

export function closeOnlineSocket() {
	if (onlineSocket) {
		onlineSocket.close();
		onlineSocket = null;
	}
}