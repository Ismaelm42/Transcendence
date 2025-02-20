document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("dataForm") as HTMLFormElement;

    if (!form) {
        console.error("Form not found!");
        return;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const keyInput = document.getElementById("key") as HTMLInputElement;
        const valueInput = document.getElementById("value") as HTMLInputElement;

        if (!keyInput || !valueInput) {
            console.error("Inputs not found!");
            return;
        }

        const data = {
            [keyInput.value]: valueInput.value
        };

        try {
            const response = await fetch("https://localhost:8443/back/api/data", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            console.log("Server Response:", result);
        }
        catch (error) {
            console.error("Error:", error);
        }
    });
});
