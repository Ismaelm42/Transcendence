import { SPA } from '../spa/spa.js';
import { showMessage } from '../modal/showMessage.js';
import { initOnlineSocket } from '../friends/onlineUsersSocket.js';

export async function handleLoginSubmit(event: SubmitEvent) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch("https://localhost:8443/back/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            showMessage(`Error: ${errorResponse.message}`, null);
        } else {
            const result = await response.json();
            initOnlineSocket(); // Inicia el socket aquí
            const app = SPA.getInstance();
            app.navigate("home");
        }
    } catch (error) {
    }
}
