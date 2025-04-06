import { SPA } from './spa.js';

export async function handleRegisterSubmit(event: SubmitEvent) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
	if (data.password !== data.confirm_password) {
		alert("Las contraseñas no coinciden. Por favor, verifica e intenta nuevamente.");
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
				if (response.status === 409) {
		            alert("El nombre de usuario o el correo ya existe. Por favor, elige otro.");
		        } else if (response.status === 500) {
		            alert("Error interno del servidor. Por favor, inténtalo más tarde.");
		        } else if (response.status === 400) {
		            alert("Error en la solicitud. Por favor, verifica los datos ingresados.");
		        } else {
		            alert("Error desconocido. Por favor, inténtalo más tarde.");
		        }
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

    	 } catch (error) {
			console.error("Error al enviar el formulario de registro:", error);
	    console.error("Error en el registro o login:", error);
	    return "Error al enviar el formulario de registro o username ya existente";
	}
}