var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { showMessage } from "./showMessage.js";
function changePassword() {
    const form = document.getElementById("change-password-form");
    form === null || form === void 0 ? void 0 : form.addEventListener("submit", (event) => {
        event.preventDefault();
    });
    console.log("Change password button clicked changePassword launched");
    const changePasswordModal = document.getElementById("change-password-modal");
    const cancelModalButton = document.getElementById("cancel-modal-password");
    if (changePasswordModal) {
        changePasswordModal.classList.remove("hidden");
    }
    const saveButton = document.getElementById("save-modal-password");
    saveButton === null || saveButton === void 0 ? void 0 : saveButton.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
        console.log("Save button clicked");
        const form = document.getElementById("change-password-form");
        const formData = new FormData(form);
        const data = {
            currentPassword: formData.get('current-password'),
            newPassword: formData.get('new-password'),
            confirmPassword: formData.get('confirm-password')
        };
        if (data.newPassword !== data.confirmPassword) {
            alert("New password and confirmation do not match");
            return;
        }
        console.log("Form data:", data);
        try {
            const response = yield fetch('https://localhost:8443/back/change_password', {
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
        }
        catch (error) {
            console.error("Error changing password:", error);
        }
    }));
    cancelModalButton === null || cancelModalButton === void 0 ? void 0 : cancelModalButton.addEventListener("click", () => {
        if (changePasswordModal) {
            changePasswordModal.classList.add("hidden");
        }
    });
}
function cancel() {
    console.log("cancel button clicked cancel launched");
    const userForm = document.getElementById("user-form");
    if (userForm) {
        const inputs = userForm.querySelectorAll("input");
        inputs.forEach(input => input.setAttribute("readonly", "true"));
        inputs.forEach(input => {
            input.style.backgroundColor = "oklch(37.3% 0.034 259.733)"; // Example of using OKLCH color in CSS
            input.style.color = "#fff"; // Cambia el fondo a un color claro para indicar que es editable
        });
    }
    const editButton = document.getElementById("edit-button");
    const changePasswordButton = document.getElementById("change-password-button");
    editButton.innerHTML = 'Edit info';
    editButton.classList.replace("bg-green-500", "bg-blue-500");
    editButton.classList.replace("hover:bg-green-600", "hover:bg-blue-600");
    changePasswordButton.innerHTML = 'Change password';
    changePasswordButton.classList.replace("bg-red-500", "bg-orange-500");
    changePasswordButton.classList.replace("hover:bg-red-600", "hover:bg-orange-600");
    changePasswordButton === null || changePasswordButton === void 0 ? void 0 : changePasswordButton.addEventListener("click", changePassword);
}
function editInfo() {
    console.log("Edit button clicked editInfo launched");
    const userForm = document.getElementById("user-form");
    // Habilitar edición de campos
    if (userForm) {
        const inputs = userForm.querySelectorAll("input");
        const nameInput = document.getElementById('usernameInput');
        const emailInput = document.getElementById('emailInput');
        const Tournamentusername = document.getElementById('tournamentusernameInput');
        console.log("nameInput:", nameInput);
        const originalUsername = nameInput.value;
        const originalEmail = emailInput.value;
        const originalTournamentusername = Tournamentusername.value;
        inputs.forEach(input => input.removeAttribute("readonly"));
        inputs.forEach(input => {
            input.style.backgroundColor = "#fff"; // Cambia el fondo a un color claro para indicar que es editable
            input.style.color = "oklch(37.3% 0.034 259.733)"; // Example of using OKLCH color in CSS
        });
        const cancelButton = document.getElementById("change-password-button");
        cancelButton === null || cancelButton === void 0 ? void 0 : cancelButton.removeEventListener('click', changePassword);
        cancelButton === null || cancelButton === void 0 ? void 0 : cancelButton.addEventListener("click", () => {
            console.log("Cancel button clicked");
            console.log("Original username:", originalUsername);
            emailInput.value = originalEmail;
            nameInput.value = originalUsername;
            emailInput.value = originalEmail;
            Tournamentusername.innerHTML = originalTournamentusername;
            // const inputs = userForm?.querySelectorAll("input");
            inputs === null || inputs === void 0 ? void 0 : inputs.forEach(input => input.setAttribute("readonly", "true"));
            inputs === null || inputs === void 0 ? void 0 : inputs.forEach(input => {
                input.style.backgroundColor = "oklch(37.3% 0.034 259.733)"; // Example of using OKLCH color in CSS
                input.style.color = "#fff"; // Cambia el fondo a un color claro para indicar que es editable
            });
            cancel();
        });
    }
}
function saveInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Edit button clicked saveInfo launched");
        const userForm = document.getElementById("user-form");
        const formData = new FormData(userForm);
        const data = Object.fromEntries(formData.entries());
        console.log("Form data:", data);
        try {
            const response = yield fetch('https://localhost:8443/back/update_user', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                alert('Profile updated successfully');
                const HeaderButton = document.getElementById("username");
                console.log("data.usernameInput. ", data.username);
                if (HeaderButton) {
                    HeaderButton.textContent = data.username.toString();
                }
                window.location.hash = "#profile";
            }
            else {
                alert('Failed to update profile');
            }
        }
        catch (error) {
            console.error("Error al enviar el formulario de registro:", error);
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
    });
}
export function handleProfile() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("En desde el ts handleProfile");
        const editButton = document.getElementById("edit-button");
        const changePasswordButton = document.getElementById("change-password-button");
        editButton === null || editButton === void 0 ? void 0 : editButton.addEventListener('click', () => {
            if (editButton.innerHTML === 'Edit info') {
                editInfo(); // Habilitas los campos o haces lo que necesites
                editButton.innerHTML = 'Save';
                editButton.classList.replace("bg-blue-500", "bg-green-500");
                editButton.classList.replace("hover:bg-blue-600", "hover:bg-green-600");
                changePasswordButton.innerHTML = 'Cancel';
                changePasswordButton.classList.replace("bg-orange-500", "bg-red-500");
                changePasswordButton.classList.replace("hover:bg-orange-600", "hover:bg-red-600");
            }
            else {
                saveInfo(); // Guardas los datos
                editButton.innerHTML = 'Edit info';
                editButton.classList.replace("bg-green-500", "bg-blue-500");
                editButton.classList.replace("hover:bg-green-600", "hover:bg-blue-600");
                changePasswordButton.innerHTML = 'Change password';
                changePasswordButton.classList.replace("bg-red-500", "bg-orange-500");
                changePasswordButton.classList.replace("hover:bg-red-600", "hover:bg-orange-600");
            }
        });
        if ((editButton === null || editButton === void 0 ? void 0 : editButton.innerHTML) === 'Edit info') {
            changePasswordButton === null || changePasswordButton === void 0 ? void 0 : changePasswordButton.addEventListener("click", changePassword);
        }
    });
}
document.addEventListener('DOMContentLoaded', () => { handleProfile(); });
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
