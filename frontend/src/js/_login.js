"use strict";
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
const registerButton = document.getElementById("registerButton");
const loginContainer = document.getElementById("loginContainer");
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
        }
        catch (error) {
            console.error(error);
        }
    });
}
function handleRegisterSubmit(event) {
    return __awaiter(this, void 0, void 0, function* () {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        try {
            const response = yield fetch("https://localhost:8443/back/create_user", {
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
        }
        catch (error) {
            console.error(error);
        }
    });
}
function loadRegisterHtml() {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch("../html/register.html");
            if (!response.ok)
                throw new Error("Failed to load the HTML file");
            const htmlContent = yield response.text();
            history.pushState(null, '', '/register');
            if (loginContainer) {
                loginContainer.innerHTML = htmlContent;
                const form = loginContainer.querySelector("form");
                form === null || form === void 0 ? void 0 : form.addEventListener("submit", handleRegisterSubmit);
                (_a = document.getElementById("registerButton")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
                (_b = document.getElementById("loginButton")) === null || _b === void 0 ? void 0 : _b.classList.remove("hidden");
                (_c = document.getElementById("headerSeparator")) === null || _c === void 0 ? void 0 : _c.classList.add("hidden");
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
function loadLoginHtml() {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch("../html/login.html");
            if (!response.ok)
                throw new Error("Failed to load the HTML file");
            const htmlContent = yield response.text();
            history.pushState(null, '', '/login');
            if (loginContainer) {
                loginContainer.innerHTML = htmlContent;
                const form = loginContainer.querySelector("form");
                form === null || form === void 0 ? void 0 : form.addEventListener("submit", handleLoginSubmit);
                const signUp = loginContainer.querySelector("#signUp");
                signUp === null || signUp === void 0 ? void 0 : signUp.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                    yield loadRegisterHtml();
                }));
                (_a = document.getElementById("loginButton")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
                (_b = document.getElementById("registerButton")) === null || _b === void 0 ? void 0 : _b.classList.remove("hidden");
                (_c = document.getElementById("headerSeparator")) === null || _c === void 0 ? void 0 : _c.classList.add("hidden");
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
document.addEventListener("DOMContentLoaded", () => {
    loginButton === null || loginButton === void 0 ? void 0 : loginButton.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
        yield loadLoginHtml();
    }));
    registerButton === null || registerButton === void 0 ? void 0 : registerButton.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
        yield loadRegisterHtml();
    }));
});
