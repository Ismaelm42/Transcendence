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
function formatTimeFromMilliseconds(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    // Formato h:mm:ss (sin ceros a la izquierda en horas)
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
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
export function fetchChessGameLogs() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const url = `https://localhost:8443/back/get_chessgamelogs`;
            const getUserResponse = yield fetch(`${url}`, {
                method: "GET",
                credentials: "include"
            });
            if (!getUserResponse.ok) {
                throw new Error("Error retrieving stats");
            }
            const userStats = yield getUserResponse.json();
            console.log("userStats:", userStats);
            return yield userStats;
            // const response = await fetch('https://localhost:8443/back/get_user_chessgamelogs`', {			
            // 	method: "GET",
            // 	credentials: "include"
            // });
            // if (!response.ok) {
            // 	throw new Error(`HTTP error! status: ${response.status}`);
            // }
            // return await response.json();
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
    if (userId == "-1")
        return "AI";
    if (userId == "-2")
        return "Guest";
    if (!userId)
        return " -- ";
    const username = userNames.get(userId);
    return username;
}
export function handleStats(userStats) {
    return __awaiter(this, void 0, void 0, function* () {
        userID = userStats.userId;
        initializeUserNames();
        yield loadChartJs();
        const canvas = document.getElementById('statsChart');
        if (!canvas) {
            console.error("Canvas element with id 'statsChart' not found.");
            return;
        }
        const canvas2 = document.getElementById('statsTournamentChart');
        if (!canvas2) {
            console.error("Tournament Canvas element with id 'statsChart' not found.");
            return;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error("Failed to get 2D context from canvas.");
            return;
        }
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
                        backgroundColor: ['#ffe90d', '#bc3112', '#feab39'],
                        borderColor: '#1F2937',
                        borderWidth: 2
                    }]
            },
            options: {
                responsive: true,
                animateRotate: true,
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                }
            }
        });
        const torunamentLoosed = userStats.tournamentsPlayed - userStats.winsInTournaments;
        const statsTournamentChart = new Chart(ctx2, {
            type: 'pie',
            data: {
                labels: ['Wins', 'Losses', 'Total'],
                datasets: [{
                        data: [userStats.winsInTournaments, torunamentLoosed, userStats.tournamentsPlayed],
                        backgroundColor: ['#ffe90d', '#bc3112', '#feab39'],
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
                    try {
                        const gameRecords = yield fetchGameLogs();
                        const users = yield fetchUsers();
                        console.log("users", users);
                        const response = yield fetch("../../html/stats/statslist.html");
                        let htmlTemplate = yield response.text();
                        let tableRows = "";
                        gameRecords.forEach((record) => {
                            const date = new Date(record.createdAt).toLocaleString();
                            const tournamentInfo = record.tournamentId ? `Tournament: ${record.tournamentId}` : "Non-tournament game";
                            if (label === 'Wins') {
                                if (record.winner == userID) {
                                    tableRows += `
							<tr class="hover:bg-pong-secondary ">
								<td class="p-2 border-b border-gray-700">${date}</td>
								<td class="p-2 border-b border-gray-700">${getUserNameById(record.winner)}</td>
								<td class="p-2 border-b border-gray-700">${getUserNameById(record.loser)}</td>
								<td class="p-2 border-b border-gray-700">${formatTimeFromMilliseconds(record.duration)}</td>
								<td class="p-2 border-b border-gray-700">${tournamentInfo}</td>
								</tr>
							`;
                                }
                            }
                            else if (label === 'Losses') {
                                if (record.loser === userID) {
                                    tableRows += `
								<tr class="hover:bg-pong-secondary ">
									<td class="p-2 border-b border-gray-700">${date}</td>
									<td class="p-2 border-b border-gray-700">${getUserNameById(record.winner)}</td>
									<td class="p-2 border-b border-gray-700">${getUserNameById(record.loser)}</td>
									<td class="p-2 border-b border-gray-700">${formatTimeFromMilliseconds(record.duration)}ms</td>
									<td class="p-2 border-b border-gray-700">${tournamentInfo}</td>
									</tr>
								`;
                                }
                            }
                            else if (label === 'Total') {
                                if (record.winner === userID || record.loser === userID) {
                                    tableRows += `
								<tr class="hover:bg-pong-secondary ">
									<td class="p-2 border-b border-gray-700">${date}</td>
									<td class="p-2 border-b border-gray-700">${getUserNameById(record.winner)}</td>
									<td class="p-2 border-b border-gray-700">${getUserNameById(record.loser)}</td>
									<td class="p-2 border-b border-gray-700">${formatTimeFromMilliseconds(record.duration)}ms</td>
									<td class="p-2 border-b border-gray-700">${tournamentInfo}</td>
									</tr>
								`;
                                }
                            }
                        });
                        htmlTemplate = htmlTemplate.replace(/{{table_rows}}/g, tableRows);
                        htmlTemplate = htmlTemplate
                            .replace(/{{label}}/g, label)
                            .replace(/{{color}}/g, color)
                            .replace(/{{table_rows}}/g, tableRows);
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
            return __awaiter(this, void 0, void 0, function* () {
                const points = statsTournamentChart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
                if (points.length) {
                    const index = points[0].index;
                    const label = statsTournamentChart.data.labels[index];
                    const color = statsTournamentChart.data.datasets[0].backgroundColor[index];
                    const value = statsTournamentChart.data.datasets[0].data[index];
                    try {
                        const gameRecords = yield fetchGameLogs();
                        const users = yield fetchUsers();
                        console.log("users", users);
                        const response = yield fetch("../../html/stats/statslist.html");
                        let htmlTemplate = yield response.text();
                        let tableRows = "";
                        gameRecords.forEach((record) => {
                            const tournamentInfo = record.tournamentId ? `Tournament: ${record.tournamentId}` : "Non-tournament game";
                            if (record.tournamentId) {
                                const date = new Date(record.createdAt).toLocaleString();
                                if (label === 'Wins') {
                                    if (record.winner == userID) {
                                        tableRows += `
								<tr class="hover:bg-pong-secondary ">
									<td class="p-2 border-b border-gray-700">${date}</td>
								<td class="p-2 border-b border-gray-700">${getUserNameById(record.winner)}</td>
								<td class="p-2 border-b border-gray-700">${getUserNameById(record.loser)}</td>
								<td class="p-2 border-b border-gray-700">${formatTimeFromMilliseconds(record.duration)}</td>
								<td class="p-2 border-b border-gray-700">${tournamentInfo}</td>
								</tr>
							`;
                                    }
                                }
                                else if (label === 'Losses') {
                                    if (record.loser === userID) {
                                        tableRows += `
								<tr class="hover:bg-pong-secondary ">
									<td class="p-2 border-b border-gray-700">${date}</td>
									<td class="p-2 border-b border-gray-700">${getUserNameById(record.winner)}</td>
									<td class="p-2 border-b border-gray-700">${getUserNameById(record.loser)}</td>
									<td class="p-2 border-b border-gray-700">${formatTimeFromMilliseconds(record.duration)}ms</td>
									<td class="p-2 border-b border-gray-700">${tournamentInfo}</td>
									</tr>
								`;
                                    }
                                }
                                else if (label === 'Total') {
                                    if (record.winner === userID || record.loser === userID) {
                                        tableRows += `
								<tr class="hover:bg-pong-secondary ">
									<td class="p-2 border-b border-gray-700">${date}</td>
									<td class="p-2 border-b border-gray-700">${getUserNameById(record.winner)}</td>
									<td class="p-2 border-b border-gray-700">${getUserNameById(record.loser)}</td>
									<td class="p-2 border-b border-gray-700">${formatTimeFromMilliseconds(record.duration)}ms</td>
									<td class="p-2 border-b border-gray-700">${tournamentInfo}</td>
									</tr>
								`;
                                    }
                                }
                            }
                        });
                        htmlTemplate = htmlTemplate.replace(/{{table_rows}}/g, tableRows);
                        htmlTemplate = htmlTemplate
                            .replace(/{{label}}/g, label)
                            .replace(/{{color}}/g, color)
                            .replace(/{{table_rows}}/g, tableRows);
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
    });
}
export function handlePongTournamentStats(proccessedStats) {
    return __awaiter(this, void 0, void 0, function* () {
        const userID = proccessedStats.userId;
        initializeUserNames();
        yield loadChartJs();
        const pongTcanvas = document.getElementById('pong-tournament-statsChart');
        if (!pongTcanvas) {
            console.error("Canvas element with id 'statsChart' not found.");
            return;
        }
        const ctx = pongTcanvas.getContext('2d');
        if (!ctx) {
            console.error("Failed to get 2D context from pongTcanvas.");
            return;
        }
        const statsChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Tournament Wins', 'Tournament Losses', 'Total'],
                datasets: [{
                        data: [proccessedStats.TournamentsWins, proccessedStats.Tournamentslosses, proccessedStats.tournamentsPlayed],
                        backgroundColor: ['#ffe90d', '#bc3112', '#feab39'],
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
        const torunamentLoosed = proccessedStats.Tournamentslosses;
        function navivageBack() {
            const container = document.getElementById("stats-modal");
            if (container) {
                container.remove();
            }
            window.removeEventListener("popstate", navivageBack);
        }
        ;
        // 🖱️ Doble click handler for game stats
        pongTcanvas.addEventListener('dblclick', function (event) {
            return __awaiter(this, void 0, void 0, function* () {
                const points = statsChart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
                if (points.length) {
                    const index = points[0].index;
                    const label = statsChart.data.labels[index];
                    const color = statsChart.data.datasets[0].backgroundColor[index];
                    try {
                        const users = yield fetchUsers();
                        console.log("users", users);
                        const response = yield fetch("../../html/stats/tournamentpongstatslist.html");
                        let htmlTemplate = yield response.text();
                        let tableRows = "";
                        proccessedStats.userStats.forEach((record) => {
                            console.log("record:", record);
                            const date = new Date(record.created_at).toLocaleString();
                            let tournamentDuration = 0;
                            const parsedGames = JSON.parse(record.games_data);
                            parsedGames.forEach((game) => {
                                tournamentDuration += game.duration;
                            });
                            const parsedConfig = JSON.parse(record.config);
                            const ScoreLimit = parsedConfig.scoreLimit ? parsedConfig.scoreLimit : 5;
                            const Difficulty = parsedConfig.difficulty ? parsedConfig.difficulty : "Unknown";
                            if (label === 'Tournament Wins') {
                                if (record.winner == proccessedStats.username) {
                                    tableRows += `
							<tr class="hover:bg-pong-secondary ">
								<td class="p-2 border-b border-gray-700">${date}</td>
								<td class="p-2 border-b border-gray-700">${record.winner}</td>
								<td class="p-2 border-b border-gray-700">${record.playerscount.toString()}</td>
								<td class="p-2 border-b border-gray-700">${formatTimeFromMilliseconds(tournamentDuration)}</td>
								<td class="p-2 border-b border-gray-700">${ScoreLimit}</td>
								<td class="p-2 border-b border-gray-700">${Difficulty}</td>
								</tr>
							`;
                                }
                            }
                            else if (label === 'Tournament Losses') {
                                if (record.winner != proccessedStats.username) {
                                    tableRows += `
								<tr class="hover:bg-pong-secondary ">
								<td class="p-2 border-b border-gray-700">${date}</td>
								<td class="p-2 border-b border-gray-700">${record.winner}</td>
								<td class="p-2 border-b border-gray-700">${record.playerscount.toString()}</td>
								<td class="p-2 border-b border-gray-700">${formatTimeFromMilliseconds(tournamentDuration)}</td>
								<td class="p-2 border-b border-gray-700">${ScoreLimit}</td>
								<td class="p-2 border-b border-gray-700">${Difficulty}</td>
									</tr>
								`;
                                }
                            }
                            else if (label === 'Total') {
                                tableRows += `
						<tr class="hover:bg-pong-secondary ">
							<td class="p-2 border-b border-gray-700">${date}</td>
								<td class="p-2 border-b border-gray-700">${record.winner}</td>
								<td class="p-2 border-b border-gray-700">${record.playerscount.toString()}</td>
								<td class="p-2 border-b border-gray-700">${formatTimeFromMilliseconds(tournamentDuration)}</td>
								<td class="p-2 border-b border-gray-700">${ScoreLimit}</td>
								<td class="p-2 border-b border-gray-700">${Difficulty}</td>
							</tr>
						`;
                            }
                        });
                        htmlTemplate = htmlTemplate.replace(/{{table_rows}}/g, tableRows);
                        htmlTemplate = htmlTemplate
                            .replace(/{{label}}/g, label)
                            .replace(/{{color}}/g, color)
                            .replace(/{{table_rows}}/g, tableRows);
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
    });
}
export function handleChessStats(userStats) {
    return __awaiter(this, void 0, void 0, function* () {
        userID = userStats.userId;
        initializeUserNames();
        yield loadChartJs();
        const chesscanvas = document.getElementById('chess-statsChart');
        if (!chesscanvas) {
            console.error("Canvas element with id 'chess-statsChart' not found.");
            return;
        }
        const chesscanvas2 = document.getElementById('chess-statsExtendedChart');
        if (!chesscanvas2) {
            console.error("Tournament Canvas element with id 'chess-statsExtendedChart' not found.");
            return;
        }
        const chess_ctx = chesscanvas.getContext('2d');
        if (!chess_ctx) {
            console.error("Failed to get 2D context from chesscanvas.");
            return;
        }
        const chess_ctx2 = chesscanvas2.getContext('2d');
        if (!chess_ctx2) {
            console.error("Failed to get 2D context from chesscanvas.");
            return;
        }
        const chessstatsChart = new Chart(chess_ctx, {
            type: 'pie',
            data: {
                labels: ['Wins', 'Draws', 'Losses', 'Total'],
                datasets: [{
                        data: [userStats.wins, userStats.draws, userStats.losses, userStats.totalGames],
                        backgroundColor: ['#ffe90d', '#ce9700', '#bc3112', '#feab39'],
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
        console.log("userStats for extended chart:", userStats);
        const statsExtendedChart = new Chart(chess_ctx2, {
            type: 'pie',
            data: {
                labels: ['Wins By CheckMate', 'Wins By Resignation', 'Wins By TimeOut', 'Losses By CheckMate', 'Losses By Resignation', 'Losses By TimeOut'],
                datasets: [{
                        data: [userStats.WinsByCheckMate, userStats.WinsByResignation, userStats.WinsByTimeouts, userStats.lostByCheckMate, userStats.lostByResignation, userStats.lostByTimeouts],
                        backgroundColor: ['#ffe90d', '#facb03', '#a67302', '#feab39', '#f15d1f', '#bc3112'],
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
        chesscanvas.addEventListener('dblclick', function (event) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log("chesscanvas dblclick event:", event);
                const points = chessstatsChart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
                if (points.length) {
                    const index = points[0].index;
                    const label = chessstatsChart.data.labels[index];
                    const color = chessstatsChart.data.datasets[0].backgroundColor[index];
                    //Obtenemos todas las partidas
                    try {
                        const gameRecords = yield fetchChessGameLogs();
                        const users = yield fetchUsers();
                        console.log("users", users);
                        const response = yield fetch("../../html/stats/chessstatslist.html");
                        let htmlTemplate = yield response.text();
                        // Generar el contenido dinámico
                        let tableRows = "";
                        gameRecords.forEach((record) => {
                            const date = new Date(record.createdAt).toLocaleString();
                            // const endType = record.endtype ? `${record.tournamentId}` : "Non-tournament game";
                            if (label === 'Wins') {
                                if (record.winner == userID) {
                                    tableRows += `
							<tr class="hover:bg-pong-secondary ">
								<td class="p-2 border-b border-gray-700">${date}</td>
								<td class="p-2 border-b border-gray-700">${getUserNameById(record.user1)}</td>
								<td class="p-2 border-b border-gray-700">${getUserNameById(record.user2)}</td>
								<td class="p-2 border-b border-gray-700">${getUserNameById(record.winner)}</td>
								<td class="p-2 border-b border-gray-700">${record.endtype}</td>
								</tr>
							`;
                                }
                            }
                            else if (label === 'Losses') {
                                if (record.loser === userID) {
                                    tableRows += `
								<tr class="hover:bg-pong-secondary ">
									<td class="p-2 border-b border-gray-700">${date}</td>
									<td class="p-2 border-b border-gray-700">${getUserNameById(record.user1)}</td>
									<td class="p-2 border-b border-gray-700">${getUserNameById(record.user2)}</td>
									<td class="p-2 border-b border-gray-700">${getUserNameById(record.winner)}</td>
									<td class="p-2 border-b border-gray-700">${record.endtype}</td>
								</tr>
								`;
                                }
                            }
                            else if (label === 'Draws') {
                                if ((record.user1 === userID || record.user2 === userID) && (record.endtype === 'agreement' || record.winner === null)) {
                                    tableRows += `
								<tr class="hover:bg-pong-secondary ">
									<td class="p-2 border-b border-gray-700">${date}</td>
									<td class="p-2 border-b border-gray-700">${getUserNameById(record.user1)}</td>
									<td class="p-2 border-b border-gray-700">${getUserNameById(record.user2)}</td>
									<td class="p-2 border-b border-gray-700">${getUserNameById(record.winner)}</td>
									<td class="p-2 border-b border-gray-700">${record.endtype}</td>
								</tr>
								`;
                                }
                            }
                            else if (label === 'Total') {
                                if (record.user1 === userID || record.user2 === userID) {
                                    tableRows += `
								<tr class="hover:bg-pong-secondary ">
									<td class="p-2 border-b border-gray-700">${date}</td>
									<td class="p-2 border-b border-gray-700">${getUserNameById(record.user1)}</td>
									<td class="p-2 border-b border-gray-700">${getUserNameById(record.user2)}</td>
									<td class="p-2 border-b border-gray-700">${getUserNameById(record.winner)}</td>
									<td class="p-2 border-b border-gray-700">${record.endtype}</td>
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
        chesscanvas2.addEventListener('dblclick', function (event) {
            return __awaiter(this, void 0, void 0, function* () {
                const points = statsExtendedChart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
                if (points.length) {
                    const index = points[0].index;
                    const label = statsExtendedChart.data.labels[index];
                    const color = statsExtendedChart.data.datasets[0].backgroundColor[index];
                    const value = statsExtendedChart.data.datasets[0].data[index];
                    // Ejecutar acción personalizada	
                    console.log(`Doble clic en: ${label} (${value})`);
                    // alert(`Doble clic en: ${label} (${value})`);
                    // Podés llamar aquí a otra función según el label
                    // if (label === 'Wins') { ... }
                    //// Inicio prueba
                    try {
                        const gameRecords = yield fetchChessGameLogs();
                        const users = yield fetchUsers();
                        console.log("users", users);
                        const response = yield fetch("../../html/stats/chessstatslist.html");
                        let htmlTemplate = yield response.text();
                        // Generar el contenido dinámico
                        let tableRows = "";
                        gameRecords.forEach((record) => {
                            const date = new Date(record.createdAt).toLocaleString();
                            // const endType = record.endtype ? `${record.tournamentId}` : "Non-tournament game";
                            if (label === 'Wins By CheckMate') {
                                if (record.winner == userID && record.endtype === 'checkmate') {
                                    tableRows += `
							<tr class="hover:bg-pong-secondary ">
								<td class="p-2 border-b border-gray-700">${date}</td>
								<td class="p-2 border-b border-gray-700">${getUserNameById(record.user1)}</td>
								<td class="p-2 border-b border-gray-700">${getUserNameById(record.user2)}</td>
								<td class="p-2 border-b border-gray-700">${getUserNameById(record.winner)}</td>
								<td class="p-2 border-b border-gray-700">${record.endtype}</td>
								</tr>
							`;
                                }
                            }
                            else if (label === 'Wins By Resignation') {
                                if (record.winner == userID && record.endtype === 'resignation') {
                                    tableRows += `
							<tr class="hover:bg-pong-secondary ">
								<td class="p-2 border-b border-gray-700">${date}</td>
								<td class="p-2 border-b border-gray-700">${getUserNameById(record.user1)}</td>
								<td class="p-2 border-b border-gray-700">${getUserNameById(record.user2)}</td>
								<td class="p-2 border-b border-gray-700">${getUserNameById(record.winner)}</td>
								<td class="p-2 border-b border-gray-700">${record.endtype}</td>
								</tr>
							`;
                                }
                            }
                            else if (label === 'Wins By TimeOut') {
                                if (record.winner == userID && record.endtype === 'timeout') {
                                    tableRows += `
							<tr class="hover:bg-pong-secondary ">
								<td class="p-2 border-b border-gray-700">${date}</td>
								<td class="p-2 border-b border-gray-700">${getUserNameById(record.user1)}</td>
								<td class="p-2 border-b border-gray-700">${getUserNameById(record.user2)}</td>
								<td class="p-2 border-b border-gray-700">${getUserNameById(record.winner)}</td>
								<td class="p-2 border-b border-gray-700">${record.endtype}</td>
								</tr>
							`;
                                }
                            }
                            else if (label === 'Losses By CheckMate') {
                                if (record.loser === userID && record.endtype === 'checkmate') {
                                    tableRows += `
								<tr class="hover:bg-pong-secondary ">
									<td class="p-2 border-b border-gray-700">${date}</td>
									<td class="p-2 border-b border-gray-700">${getUserNameById(record.user1)}</td>
									<td class="p-2 border-b border-gray-700">${getUserNameById(record.user2)}</td>
									<td class="p-2 border-b border-gray-700">${getUserNameById(record.winner)}</td>
									<td class="p-2 border-b border-gray-700">${record.endtype}</td>
								</tr>
								`;
                                }
                            }
                            else if (label === 'Losses By Resignation') {
                                if (record.loser === userID && record.endtype === 'resignation') {
                                    tableRows += `
								<tr class="hover:bg-pong-secondary ">
									<td class="p-2 border-b border-gray-700">${date}</td>
									<td class="p-2 border-b border-gray-700">${getUserNameById(record.user1)}</td>
									<td class="p-2 border-b border-gray-700">${getUserNameById(record.user2)}</td>
									<td class="p-2 border-b border-gray-700">${getUserNameById(record.winner)}</td>
									<td class="p-2 border-b border-gray-700">${record.endtype}</td>
								</tr>
								`;
                                }
                            }
                            else if (label === 'Losses By TimeOut') {
                                if (record.loser === userID && record.endtype === 'timeout') {
                                    tableRows += `
								<tr class="hover:bg-pong-secondary ">
									<td class="p-2 border-b border-gray-700">${date}</td>
									<td class="p-2 border-b border-gray-700">${getUserNameById(record.user1)}</td>
									<td class="p-2 border-b border-gray-700">${getUserNameById(record.user2)}</td>
									<td class="p-2 border-b border-gray-700">${getUserNameById(record.winner)}</td>
									<td class="p-2 border-b border-gray-700">${record.endtype}</td>
								</tr>
								`;
                                }
                            }
                        });
                        // Replace the placeholders
                        htmlTemplate = htmlTemplate.replace(/{{table_rows}}/g, tableRows);
                        htmlTemplate = htmlTemplate
                            .replace(/{{label}}/g, label)
                            .replace(/{{color}}/g, color)
                            .replace(/{{table_rows}}/g, tableRows);
                        // Insert in the DOM
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
                        console.error("Error fetching chess game logs:", error);
                    }
                    //// Fin de prueba
                }
            });
        });
    });
}
function loadChartJs() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const windowAny = window;
            // if window has a Chart, chart.js is already loaded
            if (windowAny.Chart) {
                resolve();
                return;
            }
            // if not, we load it and resolve the promise when it's loaded
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.9/dist/chart.umd.js';
            script.onload = () => {
                resolve();
            };
            script.onerror = () => {
                reject(new Error('Failed to load Chart.js'));
            };
            document.head.appendChild(script);
        });
    });
}
