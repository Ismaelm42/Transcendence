declare var Chart: any;
let userID: string;
let userNames: Map<string, string> = new Map();

async function fetchUsers(): Promise<any> {
	try {
		const response = await fetch('https://localhost:8443/back/get_users', {
			method: "GET",
		});
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return await response.json();
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to fetch users: ${error.message}`);
		} else {
			throw new Error("Failed to fetch users logs: Unknown error");
		}
	}
}

export async function fetchGameLogs(): Promise<any> {
	try {
		const response = await fetch('https://localhost:8443/back/get_gamelogs', {
			method: "GET",
			credentials: "include"
		});
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return await response.json();
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to fetch game logs: ${error.message}`);
		} else {
			throw new Error("Failed to fetch game logs: Unknown error");
		}
	}
}

export async function initializeUserNames(): Promise<void> {
	try {
		const users = await fetchUsers();
		users.forEach((user: { id: string; username: string }) => {
			userNames.set(user.id, user.username);
		});
	} catch (error) {
		console.error("Error initializing user names:", error);
	}
}

export function getUserNameById(userId: string): string | undefined {
	console.log("userId", userId);

	return userNames.get(userId);
}

export async function handleStats(userStats: { userId: string; wins: number; losses: number; totalGames: number, tournamentsPlayed: number, tournamentsWon: number }): Promise<void> {
	userID = userStats.userId;
	initializeUserNames();
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
			labels: ['Wins', 'Losses', 'Total'],
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
			labels: ['Wins', 'Looses', 'Total'],
			datasets: [{
				data: [userStats.tournamentsWon, torunamentLoosed, userStats.tournamentsPlayed],

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

	function navivageBack() {
		const container = document.getElementById("stats-modal");
		if (container) {
			container.remove();
		}
		window.removeEventListener("popstate", navivageBack);
	};
	// 🖱️ Doble click handler for game stats
	canvas.addEventListener('dblclick', async function (event) {
		const points = statsChart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);

		if (points.length) {
			const index = points[0].index;
			const label = statsChart.data.labels[index];
			const color = statsChart.data.datasets[0].backgroundColor[index]

			//Obtenemos todas las partidas
			try {
				const gameRecords = await fetchGameLogs();
				const users = await fetchUsers();
				console.log("users", users);
				const response = await fetch("../../html/stats/statslist.html");
				let htmlTemplate = await response.text();
				// Generar el contenido dinámico

				let tableRows = "";
				gameRecords.forEach((record: { createdAt: string; winner: string; loser: string; duration: number; tournamentId: string | null }) => {
					const date = new Date(record.createdAt).toLocaleString();
					const tournamentInfo = record.tournamentId ? `Tournament: ${record.tournamentId}` : "Non-tournament game";
					if (label === 'Wins') {
						if (record.winner == userID) {
							tableRows += `
							<tr class="hover:bg-gray-800">
								<td class="p-2 border-b border-gray-700">${date}</td>
								<td class="p-2 border-b border-gray-700">${getUserNameById(record.winner)}</td>
								<td class="p-2 border-b border-gray-700">${getUserNameById(record.loser)}</td>
								<td class="p-2 border-b border-gray-700">${record.duration}ms</td>
								<td class="p-2 border-b border-gray-700">${tournamentInfo}</td>
								</tr>
							`;
						}
					} else if (label === 'Losses') {
						if (record.loser === userID) {
							tableRows += `
								<tr class="hover:bg-gray-800">
									<td class="p-2 border-b border-gray-700">${date}</td>
									<td class="p-2 border-b border-gray-700">${getUserNameById(record.winner)}</td>
									<td class="p-2 border-b border-gray-700">${getUserNameById(record.loser)}</td>
									<td class="p-2 border-b border-gray-700">${record.duration}ms</td>
									<td class="p-2 border-b border-gray-700">${tournamentInfo}</td>
									</tr>
								`;
						}
					}
					else if (label === 'Total') {
						if (record.winner === userID || record.loser === userID) {
							tableRows += `
								<tr class="hover:bg-gray-800">
									<td class="p-2 border-b border-gray-700">${date}</td>
									<td class="p-2 border-b border-gray-700">${getUserNameById(record.winner)}</td>
									<td class="p-2 border-b border-gray-700">${getUserNameById(record.loser)}</td>
									<td class="p-2 border-b border-gray-700">${record.duration}ms</td>
									<td class="p-2 border-b border-gray-700">${tournamentInfo}</td>
									</tr>
								`;
						}
					}
				});

				htmlTemplate = htmlTemplate.replace(/{{table_rows}}/g, tableRows);

				// Reemplazar los marcadores de posición
				htmlTemplate = htmlTemplate
					.replace(/{{label}}/g, label)
					.replace(/{{color}}/g, color)
					.replace(/{{table_rows}}/g, tableRows);

				// Insertar en el DOM
				const container = document.createElement("div");
				container.innerHTML = htmlTemplate;
				document.body.appendChild(container);
				const closeBtn = container.querySelector("#close-stats-modal");
				if (closeBtn) {
					window.addEventListener("popstate", navivageBack)
				}

				closeBtn?.addEventListener("click", () => {
					container.remove();
					window.removeEventListener("popstate", navivageBack);
				});
			} catch (error) {
				console.error("Error fetching game logs:", error);
			}
		}
	});

	// 🖱️ Doble click handler for tournament stats
	canvas2.addEventListener('dblclick', function (event) {
		const points = statsTournamentChart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);

		if (points.length) {
			const index = points[0].index;
			const label = statsTournamentChart.data.labels[index];
			const value = statsTournamentChart.data.datasets[0].data[index];

			// Ejecutar acción personalizada	
			console.log(`Doble clic en: ${label} (${value})`);
			alert(`Doble clic en: ${label} (${value})`);

			// Podés llamar aquí a otra función según el label
			// if (label === 'Wins') { ... }
		}
	});
}

// Cargamos por cdn Chart.js para no tener que instalarlo
async function loadChartJs(): Promise<void> {
	return new Promise((resolve, reject) => {
		const script = document.createElement('script');
		// script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
		script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.9/dist/chart.umd.js';
		script.onload = () => resolve();
		script.onerror = () => reject(new Error("Failed to load Chart.js"));
		document.head.appendChild(script);
	});
}
