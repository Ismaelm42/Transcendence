var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let userID;
let userNames = new Map();
function fetchUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch('https://localhost:8443/back/get_users', {
                method: "GET",
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return yield response.json();
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch users: ${error.message}`);
            }
            else {
                throw new Error("Failed to fetch users logs: Unknown error");
            }
        }
    });
}
export function fetchGameLogs() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch('https://localhost:8443/back/get_gamelogs', {
                method: "GET",
                credentials: "include"
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return yield response.json();
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch game logs: ${error.message}`);
            }
            else {
                throw new Error("Failed to fetch game logs: Unknown error");
            }
        }
    });
}
export function initializeUserNames() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const users = yield fetchUsers();
            users.forEach((user) => {
                userNames.set(user.id, user.username);
            });
        }
        catch (error) {
            console.error("Error initializing user names:", error);
        }
    });
}
export function getUserNameById(userId) {
    console.log("userId", userId);
    return userNames.get(userId);
}
export function handleStats(userStats) {
    return __awaiter(this, void 0, void 0, function* () {
        userID = userStats.userId;
        initializeUserNames();
        // De esta forma hacemos que se ejectue el script de Chart.js
        if (typeof Chart === 'undefined') {
            yield loadChartJs();
        }
        // Asignamos el canvas a la variable
        const canvas = document.getElementById('statsChart');
        if (!canvas) {
            console.error("Canvas element with id 'statsChart' not found.");
            return;
        }
        // Asignamos el canvas a la variable
        const canvas2 = document.getElementById('statsTournamentChart');
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
        }
        ;
        // 🖱️ Doble click handler for game stats
        canvas.addEventListener('dblclick', function (event) {
            return __awaiter(this, void 0, void 0, function* () {
                const points = statsChart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
                if (points.length) {
                    const index = points[0].index;
                    const label = statsChart.data.labels[index];
                    const color = statsChart.data.datasets[0].backgroundColor[index];
                    //Obtenemos todas las partidas
                    try {
                        const gameRecords = yield fetchGameLogs();
                        const users = yield fetchUsers();
                        console.log("users", users);
                        const response = yield fetch("../../html/stats/statslist.html");
                        let htmlTemplate = yield response.text();
                        // Generar el contenido dinámico
                        let tableRows = "";
                        gameRecords.forEach((record) => {
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
                            }
                            else if (label === 'Losses') {
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
                            window.addEventListener("popstate", navivageBack);
                        }
                        closeBtn === null || closeBtn === void 0 ? void 0 : closeBtn.addEventListener("click", () => {
                            container.remove();
                            window.removeEventListener("popstate", navivageBack);
                        });
                    }
                    catch (error) {
                        console.error("Error fetching game logs:", error);
                    }
                }
            });
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
    });
}
// Cargamos por cdn Chart.js para no tener que instalarlo
function loadChartJs() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            // script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.9/dist/chart.umd.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load Chart.js"));
            document.head.appendChild(script);
        });
    });
}
