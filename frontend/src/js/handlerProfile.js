var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function handleProfile(_event) {
    return __awaiter(this, void 0, void 0, function* () {
        //  console.log("En handleProfile");
        // 	console.log ("En handleRegisterSubmit");
        // 	document.addEventListener("DOMContentLoaded", () => {
        // 	const editButton = document.getElementById("edit-button") as HTMLButtonElement | null;
        // 	const changePasswordButton = document.getElementById("change-password-button") as HTMLButtonElement | null;
        // 	const avatarInput = document.getElementById("avatar") as HTMLInputElement | null;
        // 	const avatarPreview = document.getElementById("avatar-preview") as HTMLImageElement | null;
        // 	const userForm = document.getElementById("user-form") as HTMLFormElement | null;
        // 	const changePasswordModal = document.getElementById("change-password-modal") as HTMLElement | null;
        // 	const cancelModalButton = document.getElementById("cancel-modal") as HTMLButtonElement | null;
        // 	// Habilitar edición de campos
        // 	editButton?.addEventListener("click", () => {
        // 		console.log("Edit button clicked");
        // 	  if (userForm) {
        // 		const inputs = userForm.querySelectorAll("input");
        // 		inputs.forEach(input => input.removeAttribute("readonly"));
        // 	  }
        // 	  avatarInput?.classList.remove("hidden");
        // 	  if (editButton) {
        // 		editButton.textContent = "Save";
        // 		editButton.classList.replace("bg-blue-500", "bg-green-500");
        // 	  }
        // 	});
        // 	// Mostrar modal para cambiar contraseña
        // 	changePasswordButton?.addEventListener("click", () => {
        // 	  changePasswordModal?.classList.remove("hidden");
        // 	});
        // 	// Cerrar modal
        // 	cancelModalButton?.addEventListener("click", () => {
        // 	  changePasswordModal?.classList.add("hidden");
        // 	});
        // 	// Previsualizar avatar
        // 	avatarInput?.addEventListener("change", (event) => {
        // 	  const target = event.target as HTMLInputElement | null;
        // 	  const file = target?.files?.[0];
        // 	  if (file) {
        // 		const reader = new FileReader();
        // 		reader.onload = (e) => {
        // 		  const result = e.target?.result as string | null;
        // 		  if (avatarPreview && result) {
        // 			avatarPreview.src = result;
        // 		  }
        // 		};
        // 		reader.readAsDataURL(file);
        // 	  }
        // 		});
        // 	});
        document.addEventListener('DOMContentLoaded', () => {
            const editButton = document.getElementById("edit-button");
            const changePasswordButton = document.getElementById("change-password-button");
            const avatarInput = document.getElementById("avatar");
            const avatarPreview = document.getElementById("avatar-preview");
            const userForm = document.getElementById("user-form");
            const changePasswordModal = document.getElementById("change-password-modal");
            const cancelModalButton = document.getElementById("cancel-modal");
            // Habilitar edición de campos
            editButton === null || editButton === void 0 ? void 0 : editButton.addEventListener("click", () => {
                console.log("Edit button clicked");
                if (userForm) {
                    const inputs = userForm.querySelectorAll("input");
                    inputs.forEach(input => input.removeAttribute("readonly"));
                }
                avatarInput === null || avatarInput === void 0 ? void 0 : avatarInput.classList.remove("hidden");
                if (editButton) {
                    editButton.textContent = "Save";
                    editButton.classList.replace("bg-blue-500", "bg-green-500");
                }
            });
            // Mostrar modal para cambiar contraseña
            changePasswordButton === null || changePasswordButton === void 0 ? void 0 : changePasswordButton.addEventListener("click", () => {
                changePasswordModal === null || changePasswordModal === void 0 ? void 0 : changePasswordModal.classList.remove("hidden");
            });
            // Cerrar modal
            cancelModalButton === null || cancelModalButton === void 0 ? void 0 : cancelModalButton.addEventListener("click", () => {
                changePasswordModal === null || changePasswordModal === void 0 ? void 0 : changePasswordModal.classList.add("hidden");
            });
            // // Previsualizar avatar
            // avatarInput?.addEventListener("change", (event) => {
            // 	const target = event.target;
            // 	const file = target?.files?.[0];
            // 	if (file) {
            // 		const reader = new FileReader();
            // 		reader.onload = (e) => {
            // 			const result = e.target?.result;
            // 			if (avatarPreview && result) {
            // 				avatarPreview.src = result;
            // 			}
            // 		};
            // 		reader.readAsDataURL(file);
            // 	}
            // });
        });
    });
}
