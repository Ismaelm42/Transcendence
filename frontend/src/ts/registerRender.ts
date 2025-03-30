export default class RegisterRender {
    private container: HTMLElement;

    constructor(containerId: string) {
        this.container = document.getElementById(containerId) as HTMLElement;
    }

    async render() {
        // Lógica para renderizar el registro
    }
}

// const registerButton = document.getElementById("registerButton");
// const loginContainer = document.getElementById("app-container");

// export async function handleRegisterSubmit(event: SubmitEvent) {
//     event.preventDefault();
//     const form = event.target as HTMLFormElement;
//     const formData = new FormData(form);
//     const data = Object.fromEntries(formData.entries());

//     try {
//         const response = await fetch("https://localhost:8443/back/create_user", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify(data),
//         });
//         if (!response.ok)
//             throw new Error("Failed to send data");
//         const result = await response.json();
//         console.log("Data sent successfully:", result);
//         if (loginContainer)
//             loginContainer.innerHTML = "";
//     }
//     catch (error) {
//         console.error(error);
//     }
// }

// export async function render() {
//     try {
//         const response = await fetch("../html/register.html");
//         if (!response.ok)
//             throw new Error("Failed to load the HTML file");
//         const htmlContent = await response.text();
//         history.pushState(null, '', '/register');
//         if (loginContainer) {
//             loginContainer.innerHTML = htmlContent;
//             const form = loginContainer.querySelector("form");
//             form?.addEventListener("submit", handleRegisterSubmit);
//             document.getElementById("registerButton")?.classList.add("hidden");
//             document.getElementById("loginButton")?.classList.remove("hidden");
//             document.getElementById("headerSeparator")?.classList.add("hidden");
//         }
//     }
//     catch (error) {
//         console.error(error);
//     }
// }

// document.addEventListener("DOMContentLoaded", () => {
//     registerButton?.addEventListener("click", async () => {
//         await render();
//     });
// });