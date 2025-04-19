import { showMessage } from "./showMessage.js";

declare var Chart: any;

export async function handleStats(userStats: { wins: number; losses: number; totalGames: number, tournamentsPlayed:number, tournamentsWon:number }): Promise<void> {
	console.log("handleStats received:", userStats);

	// De esta forma hacemos que se ejectue el script de Chart.js
	if (typeof Chart === 'undefined') {
		await loadChartJs();
	}
	// Asignamos el canvas a la variable
	const canvas = document.getElementById('statsChart') as HTMLCanvasElement | null;
	if (!canvas) {
		console.error("Canvas element with id 'statsChart' not found.");
		return;
	}
	// Asignamos el canvas a la variable
	const canvas2 = document.getElementById('statsTournamentChart') as HTMLCanvasElement | null;
	if (!canvas2) {
		console.error("Tournament Canvas element with id 'statsChart' not found.");
		return;
	}
	// generamos el contexto 2D del canvas
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		console.error("Failed to get 2D context from canvas.");
		return;
	}
	// generamos el contexto 2D del canvas
	const ctx2 = canvas2.getContext('2d');
	if (!ctx2) {
		console.error("Failed to get 2D context from canvas.");
		return;
	}

	const statsChart = new Chart(ctx, {
		type: 'pie',
		data: {
			labels: ['Wins', 'Losses', 'Total Games'],
			datasets: [{
				data: [userStats.wins, userStats.losses, userStats.totalGames],
				backgroundColor: ['#34D399', '#F87171', '#60A5FA'], // green, red, blue
				borderColor: '#1F2937',
				borderWidth: 2
			}]
		},
		options: {
			responsive: true,
			plugins: {
				legend: {
					labels: {
						color: 'white'
					}
				}
			}
		}
	});

	const torunamentLoosed = userStats.tournamentsPlayed - userStats.tournamentsWon;
	const statsTournamentChart = new Chart(ctx2, {
		type: 'pie',
		data: {
			labels: ['Wins', 'Looses', 'Total Tournaments'],
			datasets: [{
				data: [ userStats.tournamentsWon, torunamentLoosed, userStats.tournamentsPlayed],

				backgroundColor: ['#34D399', '#F87171', '#60A5FA'], // green, red, blue
				borderColor: '#1F2937',
				borderWidth: 2
			}]
		},
		options: {
			responsive: true,
			plugins: {
				legend: {
					labels: {
						color: 'white'
					}
				}
			}
		}
	});
	// 🖱️ Doble click handler
	canvas.addEventListener('dblclick', function(event) {
		const points = statsChart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);

		if (points.length) {
			const index = points[0].index;
			const label = statsChart.data.labels[index];
			const value = statsChart.data.datasets[0].data[index];

			// Ejecutar acción personalizada	
			console.log(`Doble clic en: ${label} (${value})`);
			alert(`Doble clic en: ${label} (${value})`);

			// Podés llamar aquí a otra función según el label
			// if (label === 'Wins') { ... }
		}
	});
	
	canvas2.addEventListener('dblclick', function(event) {
		const points = statsChart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);

		if (points.length) {
			const index = points[0].index;
			const label = statsChart.data.labels[index];
			const value = statsChart.data.datasets[0].data[index];

			// Ejecutar acción personalizada	
			console.log(`Doble clic en: ${label} (${value})`);
			alert(`Doble clic en: ${label} (${value})`);

			// Podés llamar aquí a otra función según el label
			// if (label === 'Wins') { ... }
		}
	});
}


// Cargmos por cdn Chart.js para no tener que instalarlo
async function loadChartJs(): Promise<void> {
	return new Promise((resolve, reject) => {
		const script = document.createElement('script');
		script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
		script.onload = () => resolve();
		script.onerror = () => reject(new Error("Failed to load Chart.js"));
		document.head.appendChild(script);
	});
}


// export async function handleStats(userStats: { wins: number; losses: number; totalGames: number }): Promise<void> {

// // export async function handleStats() {

// 		console.log("En desde el ts handleStats");
// 		console.log("userStats:", userStats);

// }
// 		// const editButton = document.getElementById("edit-button");
// 		// const changePasswordButton = document.getElementById("change-password-button");

// 		// requestAnimationFrame(() => {
// 		// 	changeAvatar();})
// 		// editButton?.addEventListener('click', () => {
// 		// 	if (editButton.innerHTML === 'Edit info') {
// 		// 	  	editInfo(); // Habilitas los campos o haces lo que necesites
// 		// 	  	editButton.innerHTML = 'Save';
// 		// 		editButton.classList.replace("bg-blue-500","bg-green-500");
// 		// 		editButton.classList.replace("hover:bg-blue-600","hover:bg-green-600");
// 		// 		changePasswordButton!.innerHTML = 'Cancel';
// 		// 		changePasswordButton!.classList.replace("bg-orange-500" ,"bg-red-500");
// 		// 		changePasswordButton!.classList.replace("hover:bg-orange-600", "hover:bg-red-600");

// 		// 	} else {
// 		// 	  	saveInfo(); // Guardas los datos
// 		// 	  	editButton.innerHTML = 'Edit info';
// 		// 		  editButton.classList.replace("bg-green-500", "bg-blue-500");
// 		// 		  editButton.classList.replace("hover:bg-green-600", "hover:bg-blue-600");
// 		// 		  changePasswordButton!.innerHTML = 'Change password';
// 		// 		  changePasswordButton!.classList.replace("bg-red-500", "bg-orange-500");
// 		// 		  changePasswordButton!.classList.replace("hover:bg-red-600" , "hover:bg-orange-600");
// 		// 		}
// 		// 	});
// 		// if (editButton?.innerHTML === 'Edit info'){
// 		// 		changePasswordButton?.addEventListener("click", changePassword);
// 		// }
// }

// document.addEventListener('DOMContentLoaded', () => {handleStats();});
























// // avatarInput?.classList.remove("hidden");
// 			// if (editButton) {
// 			// 	editButton.textContent = "Save";
// 			// 	editButton.classList.replace("bg-blue-500", "bg-green-500");
// 			// 	editButton.addEventListener("click", async () => {
// 			// 		const formData = new FormData(userForm as HTMLFormElement);
// 			// 		const data = Object.fromEntries(formData.entries());
// 			// 		console.log("Form data:", data);
// 			// 		try {
// 			// 			const response = await fetch('https://localhost:8443/back/update_user', {
// 			// 				method: "POST",
// 			// 				headers: {
// 			// 					"Content-Type": "application/json",
// 			// 					},
// 			// 				body: JSON.stringify(data),
// 			// 			});
// 			// 			if (response.ok) {
// 			// 				alert('Profile updated successfully');
// 			// 				const HeaderButton = document.getElementById("username");
// 			// 				if (HeaderButton) {
// 			// 					HeaderButton.textContent = data.username.toString();
// 			// 				}
// 			// 				window.location.hash = "#profile";
// 			// 				if (userForm) {
// 			// 					const inputs = userForm.querySelectorAll("input");
// 			// 					inputs.forEach(input => input.setAttribute("readonly", "true"));
// 			// 				}
// 			// 				editButton.textContent = "Edit info";
// 			// 				editButton.classList.replace("bg-green-500", "bg-blue-500");

// 			// 			} else {
// 			// 				alert('Failed to update profile');
// 			// 			}
// 			// 			} catch (error) {
// 			// 				console.error("Error al enviar el formulario de registro:", error);
// 			// 			}
// 			// 	});
// 			// 	}
// // 			});
// // }





// /*

// // function saveAvatar(avatarInput: HTMLInputElement | null, avatarPreview: HTMLImageElement | null) {
// // 		// Guardar el avatar
// // 		if (avatarInput && avatarInput.files && avatarInput.files.length > 0) {
// // 			const file = avatarInput.files[0];
// // 			const reader = new FileReader();
// // 			reader.onload = function (e) {
// // 				if (avatarPreview) {
// // 					avatarPreview.src = e.target?.result as string;
// // 				}
// // 			};
// // 			reader.readAsDataURL(file);
// // 		}
// // 	}
// // function changePassword(changePasswordButton: HTMLButtonElement | null, changePasswordModal: HTMLDivElement | null, cancelModalButton: HTMLButtonElement | null) {
// // 	// Cambiar contraseña
// // 	changePasswordButton?.addEventListener("click", () => {
// // 		console.log("Change password button clicked");

// // 		});
// // 	}
// 	}		

// function savefields(editButton: HTMLButtonElement | null, userForm: HTMLFormElement | null) {
// 	}

// export async function handleProfile() {

// 		console.log("En desde el ts handleProfile");
// 		const editButton = document.getElementById("edit-button");
// 		const changePasswordButton = document.getElementById("change-password-button");
// 		const avatarInput = document.getElementById("avatar");
// 		const avatarPreview = document.getElementById("avatar-preview");
// 		const userForm = document.getElementById("user-form");
// 		const changePasswordModal = document.getElementById("change-password-modal");
// 		const cancelModalButton = document.getElementById("cancel-modal");
	
// 		// Habilitar edición de campos
// 		editButton?.addEventListener("click", () => {
// 			console.log("Edit button clicked");
// 			if (userForm) {
// 				const inputs = userForm.querySelectorAll("input");
// 				inputs.forEach(input => input.removeAttribute("readonly"));
// 			}
// 			avatarInput?.classList.remove("hidden");
// 			if (editButton) {
// 				editButton.textContent = "Save";
// 				editButton.classList.replace("bg-blue-500", "bg-green-500");
// 				editButton.addEventListener("click", async () => {
// 					const formData = new FormData(userForm as HTMLFormElement);
// 					const data = Object.fromEntries(formData.entries());
// 					console.log("Form data:", data);
// 					try {
// 						const response = await fetch('https://localhost:8443/back/update_user', {
// 							method: "POST",
// 							headers: {
// 								"Content-Type": "application/json",
// 								},
// 							body: JSON.stringify(data),
// 						});
// 						if (response.ok) {
// 							alert('Profile updated successfully');
// 							const HeaderButton = document.getElementById("username");
// 							if (HeaderButton) {
// 								HeaderButton.textContent = data.username.toString();
// 							}
// 							window.location.hash = "#profile";
// 							if (userForm) {
// 								const inputs = userForm.querySelectorAll("input");
// 								inputs.forEach(input => input.setAttribute("readonly", "true"));
// 							}
// 							editButton.textContent = "Edit info";
// 							editButton.classList.replace("bg-green-500", "bg-blue-500");

// 						} else {
// 							alert('Failed to update profile');
// 						}
// 						} catch (error) {
// 							console.error("Error al enviar el formulario de registro:", error);
// 						}
// 				});
// 				}
// 			});
// }

// document.addEventListener('DOMContentLoaded', () => {handleProfile();});
// */

