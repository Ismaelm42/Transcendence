var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const loginButton = document.getElementById("loginButton");
const loginContainer = document.getElementById("loginContainer");
loginButton === null || loginButton === void 0 ? void 0 : loginButton.addEventListener("click", () => {
    // Create window
    const loginWindow = document.createElement("div");
    loginWindow.classList.add("login-window", "flex", "flex-col", "items-center", "space-y-4");
    // Create username label
    const usernameLabel = document.createElement('label');
    usernameLabel.textContent = 'Username ';
    // Create username input
    const usernameInput = document.createElement('input');
    usernameInput.type = 'text';
    usernameInput.id = 'username';
    usernameInput.required = true;
    // Create password label
    const passwordLabel = document.createElement('label');
    passwordLabel.textContent = 'Password ';
    // Create password input
    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.id = 'password';
    passwordInput.required = true;
    // Create submit button
    const submitButton = document.createElement("button");
    submitButton.type = "button";
    submitButton.classList.add("bg-blue-500", "text-white", "py-2", "px-4", "rounded-lg", "hover:bg-blue-600");
    submitButton.textContent = "Log in";
    // Submit function
    submitButton.addEventListener("click", (event) => __awaiter(this, void 0, void 0, function* () {
        event.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const formData = {
            username: username,
            password: password,
        };
        try {
            const response = yield fetch("https://localhost/back/api/data", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                const data = yield response.json();
                console.log("Login successful:", data);
            }
            else {
                console.log("Login failed:", response.statusText);
            }
        }
        catch (error) {
            console.error("Error submitting form:", error);
        }
    }));
    // Create Google login button
    const googleLoginButton = document.createElement("button");
    loginWindow.classList.add("google-login-button");
    googleLoginButton.textContent = "Log in with Google";
    googleLoginButton.addEventListener("click", () => {
        window.location.href = "https://localhost/back/auth/google/login";
    });
    loginWindow.appendChild(usernameLabel);
    loginWindow.appendChild(usernameInput);
    loginWindow.appendChild(passwordLabel);
    loginWindow.appendChild(passwordInput);
    loginWindow.appendChild(submitButton);
    loginWindow.appendChild(googleLoginButton);
    loginContainer === null || loginContainer === void 0 ? void 0 : loginContainer.appendChild(loginWindow);
});
