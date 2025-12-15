import { SPA } from '../spa/spa.js';
import { showMessage } from '../modal/showMessage.js';
import { formatErrors } from '../errors/FormatError.js';

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
        const response = await fetch(`https://${window.location.host}/back/register_user`, {
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
					showMessage(formatErrors(errorResponse.errors), null);
				} else {
					showMessage("Unknown error. Please try again later.", null);
		        }
			}else {
	        const app = SPA.getInstance();
	        app.navigate("home");
			}
    	 } catch (error) {
	    return "Error al enviar el formulario de registro o username ya existente";
	}
}
