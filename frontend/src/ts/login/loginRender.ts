import { Step } from '../spa/stepRender.js';
import { showMessage } from '../modal/showMessage.js';

export default class LoginRender extends Step {
	async render(appElement: HTMLElement): Promise<void>  {
		const user = await this.checkAuth();
		sessionStorage.setItem("current-view", "Login");
		if (user) {
			showMessage("User authenticated, redirecting to profile", 3000);
			window.location.hash = "#home";
		} else {
			try {
				const response = await fetch("../../html/login/login.html");
				if (!response.ok) throw new Error("Failed to load the HTML file");
		
				const htmlContent = await response.text();
				if (this.container && htmlContent) {
					this.container.innerHTML = htmlContent;
		

					// Esperar un breve tiempo antes de asignar eventos
					requestAnimationFrame(async () => {
						const forgotPasswordLink = this.container.querySelector("#forgotPassword");
						if (forgotPasswordLink) {
							forgotPasswordLink.addEventListener("click", (event) => {
								event.preventDefault();
								showMessage("“Well, maybe you should’ve written it down somewhere… Go ahead, make a new account and write it down this time!”", null);
							});
						}
						const form = this.container.querySelector("form");
						if (form) {
							try {
								const { handleLoginSubmit } = await import('./handleLoginSubmit.js');
								form.addEventListener("submit", async (event) => {
									event.preventDefault();
									handleLoginSubmit(event);
								});
							} catch (err) {
							}
						}
						const googleLoginBtn = this.container.querySelector("#google-login-btn") as HTMLElement;
						if (googleLoginBtn) {
							const hostname = window.location.hostname;
							if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
								googleLoginBtn.onclick = (event) => {
									event.preventDefault();
									showMessage("Free users can only use this feature on local sever host machine", 3000);
								};
							}
						}
					});
		
					appElement.innerHTML =  htmlContent;
				}
			} catch (error) {
				appElement.innerHTML =  `<div id="pong-container">Ocurrió un error al generar el contenido</div>`;
			}
		}
	}

	async renderHeader(headerElement: HTMLElement): Promise<void>  {
		headerElement.innerHTML = `
				<div id="authButtons" class="flex items-center">
					<a href="#register" class="text-white hover:text-gray-400 ml-2">Register</a>
				</div>
			`;
	}
}
