var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("dataForm");
    if (!form) {
        console.error("Form not found!");
        return;
    }
    form.addEventListener("submit", (event) => __awaiter(this, void 0, void 0, function* () {
        event.preventDefault();
        const keyInput = document.getElementById("key");
        const valueInput = document.getElementById("value");
        if (!keyInput || !valueInput) {
            console.error("Inputs not found!");
            return;
        }
        const data = {
            [keyInput.value]: valueInput.value,
        };
        try {
            const response = yield fetch("https://localhost:8443/back/api/data", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            const result = yield response.json();
            console.log("Server Response:", result);
        }
        catch (error) {
            console.error("Error:", error);
        }
    }));
});
