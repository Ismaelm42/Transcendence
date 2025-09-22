import { SPA } from '../spa/spa.js';
import { showMessage } from '../modal/showMessage.js';

export async function handleRegisterSubmit(event: SubmitEvent) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
	if (data.password !== data.confirm_password) {
		showMessage("Passwords do not match. Please check it and try again.", null);
		return;
	}
    try {
        const response = await fetch("https://localhost:8443/back/register_user", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
    		if (!response.ok) 
			{
				const errorResponse = await response.json();
				if (response.status === 409) {
					showMessage(`Error: ` + errorResponse.error, null);
				} else if (response.status === 500) {
					showMessage("Internal server error. Please try again later.", null);
				} else if (response.status === 400) {
					showMessage("Bad request. Please check the entered data.", null);
				} else {
					showMessage("Unknown error. Please try again later.", null);
		        }
			}else {	
			// ;
			// try
			// {
			// 	const result = await response.json();
			// 	console.log("Resultado del registro:", result);
			// } catch (error) {
			// 	console.error("Error al realizar el registro:", error);
	        //     if (error instanceof Error) {
	        //         alert("Error: " + error.message);
	        //     } else {
	        //         alert("Error: An unknown error occurred");
	        //     }
			// }
	        // Navegar a la página de inicio
	        const app = SPA.getInstance();
	        app.navigate("home");
			}
    	 } catch (error) {
			console.error("Error al enviar el formulario de registro:", error);
	    console.error("Error en el registro o login:", error);
	    return "Error al enviar el formulario de registro o username ya existente";
	}
}
