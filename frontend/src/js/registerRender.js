var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export default class RegisterRender {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }
    render() {
        return __awaiter(this, void 0, void 0, function* () {
            // Lógica para renderizar el registro
        });
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
