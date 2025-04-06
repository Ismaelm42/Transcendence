import { Step } from './stepRender.js';

export default class LoginRender extends Step {

	async render(): Promise<string> {
		console.log("En logout render");
		try {
			const response = await fetch("https://localhost:8443/back/auth/logout", {
                method: "POST",
                credentials: "include",
            });
			if (!response.ok) throw new Error("Failed to logout");
			console.log("User logged out successfully.");

            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

            // Redirigir a la página principal
            window.location.hash = "#home";

            return "<h1>Logout successful</h1>";
        } catch (error) {
            console.error("Error during logout:", error);
            return "<h1>Logout failed</h1>";
        }
	}
}
