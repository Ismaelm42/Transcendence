export async function handleProfile(_event: SubmitEvent) {
	 console.log("En handleProfile");
	}
		console.log ("En handleRegisterSubmit");
		document.addEventListener("DOMContentLoaded", () => {
		const editButton = document.getElementById("edit-button") as HTMLButtonElement | null;
		const changePasswordButton = document.getElementById("change-password-button") as HTMLButtonElement | null;
		const avatarInput = document.getElementById("avatar") as HTMLInputElement | null;
		const avatarPreview = document.getElementById("avatar-preview") as HTMLImageElement | null;
		const userForm = document.getElementById("user-form") as HTMLFormElement | null;
		const changePasswordModal = document.getElementById("change-password-modal") as HTMLElement | null;
		const cancelModalButton = document.getElementById("cancel-modal") as HTMLButtonElement | null;
	  
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
		  }
		});

		// Mostrar modal para cambiar contraseña
		changePasswordButton?.addEventListener("click", () => {
		  changePasswordModal?.classList.remove("hidden");
		});

		// Cerrar modal
		cancelModalButton?.addEventListener("click", () => {
		  changePasswordModal?.classList.add("hidden");
		});

		// Previsualizar avatar
		avatarInput?.addEventListener("change", (event) => {
		  const target = event.target as HTMLInputElement | null;
		  const file = target?.files?.[0];
		  if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
			  const result = e.target?.result as string | null;
			  if (avatarPreview && result) {
				avatarPreview.src = result;
			  }
			};
			reader.readAsDataURL(file);
		  }
			});
		});
