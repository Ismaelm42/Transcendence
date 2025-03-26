import  {SPA} from './spa.js';

const loginButton = document.getElementById("loginButton");
const loginContainer = document.getElementById("app-container");
const menuContainer = document.getElementById("menu-container");

async function handleLoginSubmit(event: SubmitEvent) {
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
        if (!response.ok)
		{
			const errorResponse = await response.json();
			alert(`Error message: , ${errorResponse.message}`);
			//throw new Error("Failed to send data");
		}
		else
		{
			const result = await response.json();
	        console.log("Data sent successfully:", result);
	        if (loginContainer)
	            loginContainer.innerHTML = "";
	        if (menuContainer)
	            menuContainer.innerHTML = 
				`<nav id="nav" class="bg-gray-800 p-4 hidden">
				<ul class="flex space-x-4">
					<li><a href="#play-pong" class="text-white hover:text-gray-400">Play Game</a></li>
					<li><a href="#play-tournament" class="text-white hover:text-gray-400">Start Tournament</a></li>
					<li><a href="#friends" class="text-white hover:text-gray-400">Friends</a></li>
					<li><a href="#chat" class="text-white hover:text-gray-400">Chat</a></li>
					<li><a href="#stats">Stats</a></li>
				</ul>
			</nav>`;

			// // se podría crear en una función navigate y llamarla navigate('#home');
			// history.pushState(null, '', '#home');
			// const homeEvent = new Event("home");
			// document.dispatchEvent(homeEvent);
			const app = new SPA('content');
			app.navigate("#home");

		}	
    }
    catch (error) {
        console.error(error);
    }
}

async function render() {
    try {
        const response = await fetch("../html/login.html");
        if (!response.ok)
            throw new Error("Failed to load the HTML file");
        const htmlContent = await response.text();
        history.pushState(null, '', '/login');
        if (loginContainer) {
            loginContainer.innerHTML = htmlContent;
            const form = loginContainer.querySelector("form");
            form?.addEventListener("submit", handleLoginSubmit);
            const signUp = loginContainer.querySelector("#signUp");
            signUp?.addEventListener("click", async () => {
                await import('./register.js').then(module => module.render());
            });
            // document.getElementById("loginButton")?.classList.add("hidden");
            // document.getElementById("registerButton")?.classList.remove("hidden");
            // document.getElementById("headerSeparator")?.classList.add("hidden");
        }
    }
    catch (error) {
        console.error(error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loginButton?.addEventListener("click", async () => {
        await render();
    });
});

export { render , handleLoginSubmit};