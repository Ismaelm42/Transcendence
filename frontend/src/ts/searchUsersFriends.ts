import { SearchItem } from "./searchItem.js";
import { showMessage } from "./showMessage.js";

export async function searchUsersFriends(btnSearch: HTMLElement): Promise<void> {
	btnSearch.addEventListener("click", async (e) => {
		e.preventDefault();
		const searchInput = document.getElementById("searchInput") as HTMLInputElement;
		const searchValue = searchInput.value.trim();
		searchInput.value = ""; // Clear the input field after search
		if (searchValue.length < 3) {
			showMessage("Search value must be at least 3 characters long.", 2000);
			return;
		}
		try {
			console.log("searchValue:", searchValue);
			const AllusersResponse = await fetch("https://localhost:8443/back/get_users", {
				method: "GET",
				credentials: "include",
			});
			if (AllusersResponse.ok) {
				console.log("response:", AllusersResponse);
				const AllUserList: { id: number; username: string }[] = await AllusersResponse.json();
				console.log("userList:", AllUserList);
				let filteredUser : { id: number; username: string };
				let filteredUserList: { id: number; username: string }[] = [];
				AllUserList.forEach(user => {
					if (user.username.toUpperCase().includes(searchValue.toUpperCase())) {
						filteredUser = { id: user.id, username: user.username };
						// Add the filtered user to a new filtered list
						filteredUserList.push(filteredUser);
					}
				});
				console.log("Filtered User List:", filteredUserList);

			}else
				{
					const errorMessage = await AllusersResponse.json();
					console.error("Error retrieving user list:", errorMessage);
					showMessage(errorMessage.error, 2000);
				}
			
		}catch (error) {
			console.error("Error retrieving user list:", error);
			showMessage("An error occurred while retrieving the user list.", 2000);
		}

		// try {
		// 	const response = await fetch("https://localhost:8443/back/get_all_friends_entries_from_an_id", {
		// 		method: "POST",
		// 		credentials: "include",
		// 		headers: {
		// 			"Content-Type": "application/json",
		// 		},
		// 		body: JSON.stringify({ searchValue }),
		// 	});
			
		// 	if (response.ok) {
		// 		const userStats = await response.json();
		// 		console.log("userList:", userStats);
		// 		userStats.forEach((user, index) => {
		// 			const searchItem = new SearchItem('search_results', [user.id, user.username], user.status);
		// 			searchItem.render(document.getElementById("search-results")!);
		// 		});
		// 	} else {
		// 		const errorMessage = await response.json();
		// 		showMessage(errorMessage.error, 2000);
		// 	}
		// } catch (error) {
		// 	console.error("Error retrieving user list:", error);
		// 	showMessage("An error occurred while retrieving the user list.", 2000);
		// }


	});
	// const searchInput = document.getElementById("searchInput") as HTMLInputElement;
	// const searchValue = searchInput.value.trim();

	// try {
	// 	const response = await fetch("https://localhost:8443/back/get_all_friends_entries_from_an_id", {
	// 		method: "POST",
	// 		credentials: "include"
	// 	});
		
	// 	if (response.ok) {
	// 		console.log("response:", response);
	// 		const userStats = await response.json();
	// 		console.log("userList:", userStats);
	// 	}
	// 	else{
	// 		const errorMessage = await response.json();
	// 		console.error("Error retrieving user list:", errorMessage);
	// 	}	

	// 	/** Hardcode para simular resultados */
	// 	const searchItem = new SearchItem('search_results', ["6", "Pepe112@gmail.com"], 0);
	// 	const searchItem1 = new SearchItem('search_results', ["3", "Pepe2"], 1);
	// 	const searchItem2 = new SearchItem('search_results', ["4", "Pepe3"], 2);
	// 	const searchItem3 = new SearchItem('search_results', ["1236", "Pepe4"], 3);
	// 	const searchItem4 = new SearchItem('search_results', ["1237", "Pepe5"], 4);
	// }catch (error) {
	// 	console.error("Error retrieving user list:", error);
	// }

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////                       inicio de la tabla de resultados      							/////////////	
	////////             ver si se puede insertar aquí o antes de devolver los resultados			/////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// const searchTableTemplate = await fetch("../html/search_table.html");
	// if (!searchTableTemplate.ok) throw new Error("Failed to load the HTML file");
	// else 
	// {
	// 	const searchMainContainer = document.getElementById("search-main-container");
	// 	let searchTableContent = await searchTableTemplate.text();
	// 	if (searchMainContainer && searchTableContent) {
	// 		searchMainContainer.innerHTML += searchTableContent;
	// 	}
	// }
}