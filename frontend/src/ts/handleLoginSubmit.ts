import { SPA } from './spa.js';
import { showMessage } from './showMessage.js';

export async function handleLoginSubmit(event: SubmitEvent) {
	console.log("handleLoginSubmit:", event);
	
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
            console.log("Login exitoso:", result);

            const app = SPA.getInstance();
            app.navigate("home");
        }
    } catch (error) {
        console.error("Error al enviar el formulario de login:", error);
    }
}