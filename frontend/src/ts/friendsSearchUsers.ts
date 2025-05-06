import { SearchResultItem } from "./friendsResultItems.js";
import { showMessage } from "./showMessage.js";

export async function searchUsersFriends(origen: 'boton' | 'codigo', event?: Event): Promise<void> {

	if (event) {
		event.preventDefault(); // Prevenir el comportamiento por defecto del evento
	}
	const searchInput = document.getElementById("searchInput") as HTMLInputElement;
	const lastSearch = document.getElementById("friendLastSearch") as HTMLInputElement;

	let searchValue = searchInput.value.trim();

	// Si llamamos a la función para actualizar la lista despues de pulsar un boton de un cbccomponent
	if (lastSearch.textContent!.length > 0 && origen === 'codigo') {
		searchValue = lastSearch.textContent!.trim();
	}

	if (searchValue !== "") {
		lastSearch.textContent = searchValue; // Guardar el último valor de búsqueda
	}

	searchInput.value = ""; // Limpiar el input

	if (searchValue.length < 3) {
		showMessage("Search value must be at least 3 characters long.", 2000);
		return;
	}
	const requestBody = { keyword: searchValue };

	console.log("searchValue antes del try :" + searchValue);
	console.log("searchValue antes del try :" + searchValue);
	console.log("searchValue antes del try :" + searchValue);
	console.log("searchValue antes del try :" + searchValue);
	console.log("searchValue antes del try :" + searchValue);
	console.log("searchValue antes del try :" + searchValue);
	console.log("searchValue antes del try :" + searchValue);
	console.log("searchValue antes del try :" + searchValue);
	console.log("searchValue antes del try :" + searchValue);
	console.log("searchValue antes del try :" + searchValue);
	
	console.log("requestBody antes del try :" + requestBody);;
	
	try {
		const response = await fetch("https://localhost:8443/back/get_all_users_coincidences", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(requestBody),
		});

		if (!response.ok) {
			const errorMessage = await response.json();
			console.error("Error retrieving user list:", errorMessage);
			showMessage(errorMessage.error, null);
			return;
		}

		const userList = await response.json();
		const searchResultsContainer = document.querySelectorAll('.search_results_wraper');
		if (searchResultsContainer) {
			searchResultsContainer.forEach(container => {
				while (container.firstChild) {
					container.removeChild(container.firstChild); // Eliminar todos los nodos hijos
				}
			});
		}

		if (!userList || userList.length === 0) {
			console.log("vengo vacío");
			showMessage("No users found", 1000);
			return;
		}
		// Cargar HTML cabecera base una sola vez
		const searchTableTemplate = await fetch("../html/search_table.html");
		if (!searchTableTemplate.ok){ 
			console.error("Error loading HTML file:");
			throw new Error("Failed to load the HTML file")
		}else{	
			const tableHTML = await searchTableTemplate.text();
			const searchMainContainer = document.getElementById("search-main-container");
			const newdiv = document.createElement("div");
			newdiv.className = "search_results_wraper";
			newdiv.innerHTML= tableHTML;
			if (searchMainContainer)  { searchMainContainer.appendChild(newdiv); }
		}

		// Iterar sobre usuarios
		for (const user of userList) {
			if (!user || !user.id) continue;
			const status = user.status.trim();
			const role = user.role.trim();
			let statusCode = 0;
			if (status === "accepted") statusCode = 1;
			else if (status === "pending" && role === "passive") statusCode = 2;
			else if (status === "pending" && role === "active") statusCode = 3;
			else if (status === "blocked" && role === "passive") statusCode = 4;
			else if (status === "blocked" && role === "active") statusCode = 5;
			console.log("user antes del SearchResultItem:", user);
			new SearchResultItem("search_results", [user.id, user.username], statusCode);
		}
	} catch (error) {
		console.error("Error retrieving user list:", error);
		showMessage("An error occurred while retrieving the user list.", null);
	}
}
