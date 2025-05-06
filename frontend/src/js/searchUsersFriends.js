var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { SearchItem } from "./friends_search_Item.js";
import { showMessage } from "./showMessage.js";
export function searchUsersFriends(event) {
    return __awaiter(this, void 0, void 0, function* () {
        event.preventDefault();
        const searchInput = document.getElementById("searchInput");
        const searchValue = searchInput.value.trim();
        searchInput.value = ""; // Limpiar el input
        if (searchValue.length < 3) {
            showMessage("Search value must be at least 3 characters long.", 2000);
            return;
        }
        const requestBody = { keyword: searchValue };
        try {
            console.log("searchValue:", searchValue);
            const response = yield fetch("https://localhost:8443/back/get_all_users_coincidences", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });
            if (!response.ok) {
                const errorMessage = yield response.json();
                console.error("Error retrieving user list:", errorMessage);
                showMessage(errorMessage.error, 2000);
                return;
            }
            const userList = yield response.json();
            console.log("userList 0 :", userList);
            const searchResultsContainer = document.querySelectorAll('.search_results_wraper');
            if (searchResultsContainer) {
                searchResultsContainer.forEach(container => {
                    while (container.firstChild) {
                        container.removeChild(container.firstChild); // Eliminar todos los nodos hijos
                    }
                });
            }
            console.log("userList 2 : ", userList);
            // Cargar HTML base una sola vez
            const searchTableTemplate = yield fetch("../html/search_table.html");
            if (!searchTableTemplate.ok) {
                console.error("Error loading HTML file:");
                throw new Error("Failed to load the HTML file");
            }
            else {
                console.log("En else");
                const tableHTML = yield searchTableTemplate.text();
                const searchMainContainer = document.getElementById("search-main-container");
                const newdiv = document.createElement("div");
                newdiv.className = "search_results_wraper";
                newdiv.innerHTML = tableHTML;
                if (searchMainContainer) {
                    searchMainContainer.appendChild(newdiv);
                }
            }
            // Iterar sobre usuarios
            console.log("userList 3 : ", userList);
            for (const user of userList) {
                if (!user || !user.id)
                    continue;
                const status = user.status.trim();
                const role = user.role.trim();
                let statusCode = 0;
                if (status === "accepted")
                    statusCode = 1;
                else if (status === "pending" && role === "passive")
                    statusCode = 2;
                else if (status === "pending" && role === "active")
                    statusCode = 3;
                else if (status === "blocked" && role === "passive")
                    statusCode = 4;
                else if (status === "blocked" && role === "active")
                    statusCode = 5;
                console.log("user antes del SearchItem:", user);
                new SearchItem("search_results", [user.id, user.username], statusCode);
            }
        }
        catch (error) {
            console.error("Error retrieving user list:", error);
            showMessage("An error occurred while retrieving the user list.", 2000);
        }
    });
}
///////////////////////// primera adaptación no termina de funcionar /////////////
// import { SearchItem } from "./friends_search_Item.js";
// import { showMessage } from "./showMessage.js";
// export async function searchUsersFriends(event: MouseEvent): Promise<void> {
// 	event.preventDefault();
// 	const searchInput = document.getElementById("searchInput") as HTMLInputElement;
// 	const searchValue = searchInput.value.trim();
// 	searchInput.value = ""; // Limpiar el input
// 	if (searchValue.length < 3) {
// 		showMessage("Search value must be at least 3 characters long.", 2000);
// 		return;
// 	}
// 	const requestBody = { keyword: searchValue };
// 	try {
// 		console.log("searchValue:", searchValue);
// 		const response = await fetch("https://localhost:8443/back/get_all_users_coincidences", {
// 			method: "POST",
// 			credentials: "include",
// 			headers: { "Content-Type": "application/json" },
// 			body: JSON.stringify(requestBody),
// 		});
// 		if (!response.ok) {
// 			const errorMessage = await response.json();
// 			console.error("Error retrieving user list:", errorMessage);
// 			showMessage(errorMessage.error, 2000);
// 			return;
// 		}
// 		const userList = await response.json();
// 		// Limpiar resultados anteriores si es necesario
// 		const searchMainContainer = document.getElementById("search-main-container");
// 		if (!searchMainContainer) return;
// 		const searchResultsContainer = document.getElementById("search_results");
// 		if (searchResultsContainer) {
// 			searchResultsContainer.innerHTML = ""; // Limpiar resultados anteriores
// 		// Cargar HTML base una sola vez
// 		const templateResponse = await fetch("../html/search_table.html");
// 		if (!templateResponse.ok) throw new Error("Failed to load the HTML file");
// 		const tableHTML = await templateResponse.text();
// 		searchMainContainer.innerHTML = tableHTML;
// 		// Iterar sobre usuarios
// 		for (const user of userList) {
// 			if (!user || !user.id) continue;
// 			const status = user.status.trim();
// 			const role = user.role.trim();
// 			let statusCode = 0;
// 			if (status === "accepted") statusCode = 1;
// 			else if (status === "pending" && role === "passive") statusCode = 2;
// 			else if (status === "pending" && role === "active") statusCode = 3;
// 			else if (status === "blocked" && role === "passive") statusCode = 4;
// 			else if (status === "blocked" && role === "active") statusCode = 5;
// 			new SearchItem("search_results", [user.id, user.username], statusCode);
// 		}}
// 	} catch (error) {
// 		console.error("Error retrieving user list:", error);
// 		showMessage("An error occurred while retrieving the user list.", 2000);
// 	}
// }
/////////////////////////// my vesion ////////////////////////
// funciona pero hay que recargar y la llamada tiene que venir con el boton como argumento
// import { SearchItem } from "./friends_search_Item.js";
// import { showMessage } from "./showMessage.js";
// export async function searchUsersFriends(btnSearch: HTMLElement): Promise<void> {
// 	btnSearch.addEventListener("click", async (e) => {
// 		e.preventDefault();
// 		const searchInput = document.getElementById("searchInput") as HTMLInputElement;
// 		const searchValue = searchInput.value.trim();
// 		searchInput.value = ""; // Clear the input field after search
// 		if (searchValue.length < 3) {
// 			showMessage("Search value must be at least 3 characters long.", 2000);
// 			return;
// 		}
// 		const requestBody = {
// 			"keyword": searchValue
// 		};
// 		try {
// 			console.log("searchValue:", searchValue);
// 			const AllusersResponse = await fetch("https://localhost:8443/back/get_all_users_coincidences", {
// 				method: "POST",
// 				credentials: "include",
// 				headers: {
// 					"Content-Type": "application/json",
// 					},
// 					body: JSON.stringify(requestBody),
// 				});
// 			if (AllusersResponse.ok) {
// 				// console.log("response:", AllusersResponse);
// 				const userList = await AllusersResponse.json();
// 				// console.log("userList:", userList);
// 					userList.forEach(async (user: { id: string; username: string; status: string ; role: string }) => {	
// 						if (user && user.id){
// 							const searchTableTemplate = await fetch("../html/search_table.html");
// 							if (!searchTableTemplate.ok) throw new Error("Failed to load the HTML file");
// 							else 
// 								{
// 								const searchMainContainer = document.getElementById("search-main-container");
// 								let searchTableContent = await searchTableTemplate.text();
// 								if (searchMainContainer && searchTableContent) {
// 									searchMainContainer.innerHTML += searchTableContent;
// 								}
// 								}
// 							}
// 						if (user.status.trim() === "none") {
// 							const searchItem = new SearchItem('search_results', [user.id, user.username], 0);
// 						} else if (user.status.trim() === "accepted") {
// 							const searchItem = new SearchItem('search_results', [user.id, user.username], 1);
// 						} else if (user.status.trim() === "pending" && user.role.trim() === "passive") {
// 							const searchItem = new SearchItem('search_results', [user.id, user.username], 2);
// 						} else if (user.status.trim() === "pending" && user.role.trim() === "active") {
// 							const searchItem = new SearchItem('search_results', [user.id, user.username], 3);
// 						} else if (user.status.trim() === "blocked" && user.role.trim() === "passive") {
// 							const searchItem = new SearchItem('search_results', [user.id, user.username], 4);
// 						}else if (user.status.trim() === "blocked" && user.role.trim() === "activ") {
// 							const searchItem = new SearchItem('search_results', [user.id, user.username], 5);
// 						}
// 					});
// 				}else{
// 					const errorMessage = await AllusersResponse.json();
// 					console.error("Error retrieving user list:", errorMessage);
// 					showMessage(errorMessage.error, 2000);
// 				}
// 		}catch (error) {
// 			console.error("Error retrieving user list:", error);
// 			showMessage("An error occurred while retrieving the user list.", 2000);
// 		}
// 	});
// }
