import  { showMessage } from "../modal/showMessage.js";

let originalUsername = "";
let originalEmail = "";
let originalTournamentusername = "";

function changePassword(){
	const form = document.getElementById("change-password-form");
	form?.addEventListener("submit", (event) => {
		event.preventDefault();
	});
	console.log("Change password button clicked changePassword launched");
	const changePasswordModal = document.getElementById("change-password-modal");
	const cancelModalButton = document.getElementById("cancel-modal-password");
	if (changePasswordModal) {
		changePasswordModal.classList.remove("hidden");
	}
	const saveButton = document.getElementById("save-modal-password");
	saveButton?.addEventListener("click", async () => {
		console.log ("Save button clicked");
		const form = document.getElementById("change-password-form") as HTMLFormElement;	
		const formData = new FormData(form);

		const data = {
		  currentPassword: formData.get('current-password'),
		  newPassword: formData.get('new-password'),
		  confirmPassword: formData.get('confirm-password')
		};
		if (data.newPassword !== data.confirmPassword) {
			showMessage("New password and confirmation do not match", null);
			return;
		}
		console.log("Form data:", data);
		try {
			const response = await fetch('https://localhost:8443/back/change_password', {
			method: "POST",
			credentials: 'include',
			headers: {
				"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
				});
			if (response.ok) {
				const inputs = form.querySelectorAll("input");
				inputs.forEach(input => input.value = "");
				showMessage('Password changed successfully', null);	
				if (changePasswordModal) {
					changePasswordModal.classList.add("hidden");
				}
			}
			
		}catch (error) {
			console.error("Error changing password:", error);
		}
		});
	
		cancelModalButton?.addEventListener("click", () => {
		if (changePasswordModal) {
			changePasswordModal.classList.add("hidden");
		}
	});
}

function cancel(){
	console.log ("cancel button clicked cancel launched");
	console.log("Original values:", originalUsername, originalEmail, originalTournamentusername);
	const userForm = document.getElementById("user-form");
	if (userForm) {
		const inputs = userForm.querySelectorAll("input");
		const nameInput = document.getElementById('usernameInput') as HTMLInputElement;
		const emailInput = document.getElementById('emailInput') as HTMLInputElement;
		const Tournamentusername = document.getElementById('tournamentusernameInput') as HTMLInputElement;
		emailInput.value = originalEmail;
		nameInput.value = originalUsername;
		emailInput.value = originalEmail;
		Tournamentusername.value = originalTournamentusername;
		inputs.forEach(input => input.setAttribute("readonly", "true"));
		inputs.forEach(input => {
			input.style.backgroundColor = "oklch(37.3% 0.034 259.733)"; // Example of using OKLCH color in CSS
			input.style.color = "#fff"; // Cambia el fondo a un color claro para indicar que es editable
		});
	}
	const editButton = document.getElementById("edit-button");
	const changePasswordButton = document.getElementById("change-password-button");
	editButton!.innerHTML = 'Edit info';
	editButton!.classList.replace("bg-green-500", "bg-blue-500");
	editButton!.classList.replace("hover:bg-green-600", "hover:bg-blue-600");
	changePasswordButton!.innerHTML = 'Change password';
	changePasswordButton!.classList.replace("bg-red-500", "bg-orange-500");
	changePasswordButton!.classList.replace("hover:bg-red-600" , "hover:bg-orange-600");
	changePasswordButton?.removeEventListener("click", cancel);
	changePasswordButton?.addEventListener("click", changePassword);
}

function editInfo() {
	console.log("Edit button clicked editInfo launched");
	const userForm = document.getElementById("user-form");
	// Habilitar edición de campos
	if (userForm) {
		const inputs = userForm.querySelectorAll("input");
		const nameInput = document.getElementById('usernameInput') as HTMLInputElement;
		const emailInput = document.getElementById('emailInput') as HTMLInputElement;
		const Tournamentusername = document.getElementById('tournamentusernameInput') as HTMLInputElement;
		console.log("nameInput:", nameInput);
		originalUsername = nameInput.value;
		originalEmail = emailInput.value;
		originalTournamentusername = Tournamentusername.value;

		inputs.forEach(input => input.removeAttribute("readonly"));
		inputs.forEach(input => {
			input.style.backgroundColor = "#fff"; // Cambia el fondo a un color claro para indicar que es editable
			input.style.color = "oklch(37.3% 0.034 259.733)"; // Example of using OKLCH color in CSS
		});

		const cancelButton = document.getElementById("change-password-button");
		cancelButton?.removeEventListener('click', changePassword);
		cancelButton?.addEventListener("click", cancel);
	}
}		

async function saveInfo() {
	console.log("Edit button clicked saveInfo launched");
	const userForm = document.getElementById("user-form");
	const formData = new FormData(userForm as HTMLFormElement);
	const data = Object.fromEntries(formData.entries());
	console.log("Form data:", data);
	try {
		const response = await fetch('https://localhost:8443/back/update_user', {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});
		if (response.ok) {
			showMessage('Profile updated successfully', 2000);
			const HeaderButton = document.getElementById("username");
			console.log("data.usernameInput. ", data.username);
			if (HeaderButton) {
				HeaderButton.textContent = data.username.toString();
			}
			window.location.hash = "#profile";
		} else {
			const errorResponse = await response.json();
			showMessage(`Error: ${errorResponse.error}`, null);
		}
	} catch (error) {
		showMessage(`Oops, something went wrong while submitting the form. Please try again.`, 3000);
	}
	// volver a estado incial Edit info
	if (userForm) {
		const inputs = userForm.querySelectorAll("input");
		inputs.forEach(input => input.setAttribute("readonly", "true"));
		inputs.forEach(input => {
			input.style.backgroundColor = "oklch(37.3% 0.034 259.733)"; // Example of using OKLCH color in CSS
			input.style.color = "#fff"; // Cambia el fondo a un color claro para indicar que es editable
		});
	}
	const cancelButton = document.getElementById("change-password-button");
	cancelButton?.removeEventListener('click', cancel);
	cancelButton?.addEventListener("click", changePassword);
}

async function changeAvatar() {
	const avatar = document.getElementById("avatar-preview") as HTMLImageElement;
	const fileInput = document.getElementById("avatar-input") as HTMLInputElement;

	avatar?.addEventListener("dblclick", () => {
		fileInput?.click();
	});
	fileInput?.addEventListener("change", async () => {
		const file = fileInput?.files?.[0];
		if (file) {
			const formData = new FormData();
			formData.append("avatar", file);
			try {
				const response = await fetch("https://localhost:8443/back/upload_image", {
					method: "POST",
					credentials: "include",
					body: formData,
				});
				if (response.ok) {
					const result = await response.json();
					showMessage(`Image successfully updated`, null);
					avatar.src = `${result.url}?t=${new Date().getTime()}`;
					result.url
				} else {
					const errorResponse = await response.json();
					showMessage(`Image update failed: ${errorResponse.error}`, null);

				}
			} catch (error) {
				showMessage('An error occurred', null);
			}
		}
	});
};


export async function handleProfile() {

		console.log("En handleProfile desde el ts handleProfile");
		const editButton = document.getElementById("edit-button");
		const changePasswordButton = document.getElementById("change-password-button");

		requestAnimationFrame(() => {
			changeAvatar();})
		editButton?.addEventListener('click', () => {
			if (editButton.innerHTML === 'Edit info') {
			  	editInfo(); // Habilitas los campos o haces lo que necesites
			  	editButton.innerHTML = 'Save';
				editButton.classList.replace("bg-blue-500","bg-green-500");
				editButton.classList.replace("hover:bg-blue-600","hover:bg-green-600");
				changePasswordButton!.innerHTML = 'Cancel';
				changePasswordButton!.classList.replace("bg-orange-500" ,"bg-red-500");
				changePasswordButton!.classList.replace("hover:bg-orange-600", "hover:bg-red-600");

			} else {
			  	saveInfo(); // Guardas los datos
			  	editButton.innerHTML = 'Edit info';
				  editButton.classList.replace("bg-green-500", "bg-blue-500");
				  editButton.classList.replace("hover:bg-green-600", "hover:bg-blue-600");
				  changePasswordButton!.innerHTML = 'Change password';
				  changePasswordButton!.classList.replace("bg-red-500", "bg-orange-500");
				  changePasswordButton!.classList.replace("hover:bg-red-600" , "hover:bg-orange-600");
				}
			});
		if (editButton?.innerHTML === 'Edit info'){
				changePasswordButton?.addEventListener("click", changePassword);
		}
}

/** TODO - ver si es necesario descomentarlo con más pruebas - la primera prueba parece satisfactoria y no se lanza cada vez que se actualiza el dom */

// document.addEventListener('DOMContentLoaded', () => {handleProfile();});
























// avatarInput?.classList.remove("hidden");
			// if (editButton) {
			// 	editButton.textContent = "Save";
			// 	editButton.classList.replace("bg-blue-500", "bg-green-500");
			// 	editButton.addEventListener("click", async () => {
			// 		const formData = new FormData(userForm as HTMLFormElement);
			// 		const data = Object.fromEntries(formData.entries());
			// 		console.log("Form data:", data);
			// 		try {
			// 			const response = await fetch('https://localhost:8443/back/update_user', {
			// 				method: "POST",
			// 				headers: {
			// 					"Content-Type": "application/json",
			// 					},
			// 				body: JSON.stringify(data),
			// 			});
			// 			if (response.ok) {
			// 				alert('Profile updated successfully');
			// 				const HeaderButton = document.getElementById("username");
			// 				if (HeaderButton) {
			// 					HeaderButton.textContent = data.username.toString();
			// 				}
			// 				window.location.hash = "#profile";
			// 				if (userForm) {
			// 					const inputs = userForm.querySelectorAll("input");
			// 					inputs.forEach(input => input.setAttribute("readonly", "true"));
			// 				}
			// 				editButton.textContent = "Edit info";
			// 				editButton.classList.replace("bg-green-500", "bg-blue-500");

			// 			} else {
			// 				alert('Failed to update profile');
			// 			}
			// 			} catch (error) {
			// 				console.error("Error al enviar el formulario de registro:", error);
			// 			}
			// 	});
			// 	}
// 			});
// }





/*

// function saveAvatar(avatarInput: HTMLInputElement | null, avatarPreview: HTMLImageElement | null) {
// 		// Guardar el avatar
// 		if (avatarInput && avatarInput.files && avatarInput.files.length > 0) {
// 			const file = avatarInput.files[0];
// 			const reader = new FileReader();
// 			reader.onload = function (e) {
// 				if (avatarPreview) {
// 					avatarPreview.src = e.target?.result as string;
// 				}
// 			};
// 			reader.readAsDataURL(file);
// 		}
// 	}
// function changePassword(changePasswordButton: HTMLButtonElement | null, changePasswordModal: HTMLDivElement | null, cancelModalButton: HTMLButtonElement | null) {
// 	// Cambiar contraseña
// 	changePasswordButton?.addEventListener("click", () => {
// 		console.log("Change password button clicked");

// 		});
// 	}
	}		

function savefields(editButton: HTMLButtonElement | null, userForm: HTMLFormElement | null) {
	}

export async function handleProfile() {

		console.log("En desde el ts handleProfile");
		const editButton = document.getElementById("edit-button");
		const changePasswordButton = document.getElementById("change-password-button");
		const avatarInput = document.getElementById("avatar");
		const avatarPreview = document.getElementById("avatar-preview");
		const userForm = document.getElementById("user-form");
		const changePasswordModal = document.getElementById("change-password-modal");
		const cancelModalButton = document.getElementById("cancel-modal");
	
		// Habilitar edición de campos
		editButton?.addEventListener("click", () => {
			console.log("Edit button clicked");
			if (userForm) {
				const inputs = userForm.querySelectorAll("input");
				inputs.forEach(input => input.removeAttribute("readonly"));
			}
			avatarInput?.classList.remove("hidden");
			if (editButton) {
				editButton.textContent = "Save";
				editButton.classList.replace("bg-blue-500", "bg-green-500");
				editButton.addEventListener("click", async () => {
					const formData = new FormData(userForm as HTMLFormElement);
					const data = Object.fromEntries(formData.entries());
					console.log("Form data:", data);
					try {
						const response = await fetch('https://localhost:8443/back/update_user', {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
								},
							body: JSON.stringify(data),
						});
						if (response.ok) {
							alert('Profile updated successfully');
							const HeaderButton = document.getElementById("username");
							if (HeaderButton) {
								HeaderButton.textContent = data.username.toString();
							}
							window.location.hash = "#profile";
							if (userForm) {
								const inputs = userForm.querySelectorAll("input");
								inputs.forEach(input => input.setAttribute("readonly", "true"));
							}
							editButton.textContent = "Edit info";
							editButton.classList.replace("bg-green-500", "bg-blue-500");

						} else {
							alert('Failed to update profile');
						}
						} catch (error) {
							console.error("Error al enviar el formulario de registro:", error);
						}
				});
				}
			});
}

document.addEventListener('DOMContentLoaded', () => {handleProfile();});
*/

