import { Step } from '../spa/stepRender.js';

export default class LoginRender extends Step {

	async render(appElement: HTMLElement): Promise<void>  {
		console.log("En logout render");
		try {
			const response = await fetch("https://localhost:8443/back/auth/logout", {
                method: "POST",
                credentials: "include",
            });
			if (!response.ok) throw new Error("Failed to logout");
			console.log("User logged out successfully.");
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
			sessionStorage.clear();
			sessionStorage.removeItem("chatHTML");
            // Redirigir a la página principal
            
			appElement.innerHTML =  `<div id="pong-container">
									<div class="paddle left-paddle"></div>
									<h2> Logout successful, redirecting to home...</h2>
									<div class="paddle right-paddle"></div>
									</div>`;
			setTimeout(() => {
				window.location.hash = "#home";
			}, 2000);
        } catch (error) {
            console.error("Error during logout:", error);
            // appElement.innerHTML =  "<h1>Logout failed</h1>";
        }
	}
}



