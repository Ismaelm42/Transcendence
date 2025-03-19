// const logoutButton = document.getElementById("logoutButton");
// const appContainer = document.getElementById("app-container");
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// function handleLogout() {
// 	// Eliminar la cookie de inicio de sesión
// 	document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
// 	if (appContainer) {
// 		appContainer.innerHTML = "<p>You have been logged out.</p>";
// 	}
// 	console.log("User logged out successfully.");
// }
// document.addEventListener("DOMContentLoaded", () => {
// 	logoutButton?.addEventListener("click", handleLogout);
// });
// export { handleLogout };
const logoutButton = document.getElementById("logoutButton");
const loginContainer = document.getElementById("app-container");
function handleLoginSubmit(event) {
    return __awaiter(this, void 0, void 0, function* () {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        try {
            const response = yield fetch("https://localhost:8443/back/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (!response.ok)
                throw new Error("Failed to send data");
            const result = yield response.json();
            console.log("Data sent successfully:", result);
            if (loginContainer)
                loginContainer.innerHTML = "";
            // Almacenar el token de autenticación y el nombre de usuario
            localStorage.setItem('authToken', result.token);
            localStorage.setItem('username', result.username);
            // Actualizar la UI
            const spa = new SPA('app-container');
            spa.updateUI();
        }
        catch (error) {
            console.error(error);
        }
    });
}
function render() {
    return __awaiter(this, void 0, void 0, function* () {
        // Eliminar la cookie de inicio de sesión
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        if (loginContainer) {
            loginContainer.innerHTML = "<p>You have been logged out.</p>";
        }
        console.log("User logged out successfully.");
        // }
        // try {
        //     const response = await fetch("../html/login.html");
        //     if (!response.ok)
        //         throw new Error("Failed to load the HTML file");
        //     const htmlContent = await response.text();
        //     history.pushState(null, '', '/login');
        //     if (loginContainer) {
        //         loginContainer.innerHTML = htmlContent;
        //         const form = loginContainer.querySelector("form");
        //         form?.addEventListener("submit", handleLoginSubmit);
        //         const signUp = loginContainer.querySelector("#signUp");
        //         signUp?.addEventListener("click", async () => {
        //             await import('./register.js').then(module => module.render());
        //         });
        //         document.getElementById("loginButton")?.classList.add("hidden");
        //         document.getElementById("registerButton")?.classList.remove("hidden");
        //         document.getElementById("headerSeparator")?.classList.add("hidden");
        //     }
        // }
        // catch (error) {
        //     console.error(error);
        // }
    });
}
document.addEventListener("DOMContentLoaded", () => {
    logoutButton === null || logoutButton === void 0 ? void 0 : logoutButton.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
        yield render();
    }));
});
export { render, handleLoginSubmit };
