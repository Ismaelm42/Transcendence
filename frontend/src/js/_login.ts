const loginButton = document.getElementById("loginButton");
const registerButton = document.getElementById("registerButton");
const loginContainer = document.getElementById("loginContainer");

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
			throw new Error("Failed to send data");
		const result = await response.json();
		console.log("Data sent successfully:", result);
		if (loginContainer)
			loginContainer.innerHTML = "";
	}
	catch (error) {
		console.error(error);
	}
}

async function handleRegisterSubmit(event: SubmitEvent) {
	event.preventDefault();
	const form = event.target as HTMLFormElement;
	const formData = new FormData(form);
	const data = Object.fromEntries(formData.entries());

	try {
		const response = await fetch("https://localhost:8443/back/create_user", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});
		if (!response.ok)
			throw new Error("Failed to send data");
		const result = await response.json();
		console.log("Data sent successfully:", result);
		if (loginContainer)
			loginContainer.innerHTML = "";
	}
	catch (error) {
		console.error(error);
	}
}

async function loadRegisterHtml() {
	try {
		const response = await fetch("../html/register.html");
		if (!response.ok)
			throw new Error("Failed to load the HTML file");
		const htmlContent = await response.text();
		history.pushState(null, '', '/register');
		if (loginContainer) {
			loginContainer.innerHTML = htmlContent;
			const form = loginContainer.querySelector("form");
			form?.addEventListener("submit", handleRegisterSubmit);
			document.getElementById("registerButton")?.classList.add("hidden");
			document.getElementById("loginButton")?.classList.remove("hidden");
			document.getElementById("headerSeparator")?.classList.add("hidden");
		}
	}
	catch (error) {
		console.error(error);
	}
}

async function loadLoginHtml() {
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
				await loadRegisterHtml();
			});
			document.getElementById("loginButton")?.classList.add("hidden");
			document.getElementById("registerButton")?.classList.remove("hidden");
			document.getElementById("headerSeparator")?.classList.add("hidden");
		}
	}
	catch (error) {
		console.error(error);
	}
}

document.addEventListener("DOMContentLoaded", () => {
    loginButton?.addEventListener("click", async () => {
        await loadLoginHtml();
    });
    registerButton?.addEventListener("click", async () => {
        await loadRegisterHtml();
    });
});