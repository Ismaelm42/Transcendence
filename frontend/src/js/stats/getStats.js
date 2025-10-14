var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { handleStats, handleChessStats, handlePongTournamentStats } from './handleStats.js';
export function formatTimeFromMilliseconds(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    // Formato h:mm:ss (sin ceros a la izquierda en horas)
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
export function getPongStats(appElement) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const url = `https://localhost:8443/back/get_user_gamelogs`;
            const getUserResponse = yield fetch(`${url}`, {
                method: "GET",
                credentials: "include"
            });
            if (!getUserResponse.ok) {
                throw new Error("Error retrieving stats");
            }
            const userStats = yield getUserResponse.json();
            if (userStats) {
                try {
                    const statsContainer = document.getElementById("pong-stats-content");
                    const selectionElement = document.getElementById("stats_select");
                    let htmlContent = statsContainer ? statsContainer.innerHTML : '';
                    if (statsContainer) {
                        statsContainer.innerHTML = ''; // Clear previous content			
                        htmlContent = htmlContent
                            .replace("{{ totalGames }}", userStats.totalGames.toString())
                            .replace("{{ wins }}", userStats.wins.toString())
                            .replace("{{ losses }}", userStats.losses.toString())
                            .replace("{{ timePlayed }}", (formatTimeFromMilliseconds(userStats.timePlayed)).toString())
                            .replace("{{ tournamentsGames }}", userStats.tournamentsPlayed.toString())
                            .replace("{{ winsInTournaments }}", userStats.winsInTournaments.toString())
                            .replace("{{ lossesInTournaments }}", userStats.lossesInTournaments.toString());
                        statsContainer.innerHTML = htmlContent;
                        handleStats(userStats);
                    }
                }
                catch (error) {
                    console.log("Error loading HTML file:", error);
                    appElement.innerHTML = `<div id="pong-container">An error occurred while generating the content</div>`;
                }
            }
        }
        catch (error) {
            console.log("Error rendering Stats element:", error);
            appElement.innerHTML = `<div id="pong-container">An error occurred while generating the content</div>`;
        }
    });
}
export function getPongTournamentStats(appElement) {
    return __awaiter(this, void 0, void 0, function* () {
        // alert("getPongTournamentStats called");
        try {
            const url = `https://localhost:8443/back/get_user_tournamentlogs`;
            const getUserResponse = yield fetch(`${url}`, {
                method: "GET",
                credentials: "include"
            });
            if (!getUserResponse.ok) {
                throw new Error("Error retrieving stats");
            }
            const userStats = yield getUserResponse.json();
            if (userStats) {
                const userIDElement = userStats.shift(); // Remove the first element which contains only { userId: ... }
                const userId = userIDElement.userId;
                let tournamentsPlayed = 0;
                let timePlayed = 0;
                let TournamentsWon = 0;
                let TournamentsLost = 0;
                let username = '';
                userStats.forEach((tournament) => {
                    tournamentsPlayed++;
                    const parsedGames = JSON.parse(tournament.games_data);
                    const parsedUsers = JSON.parse(tournament.users);
                    parsedUsers.forEach((user) => {
                        if (user.gameplayer.id === userId) {
                            username = user.gameplayer.username;
                        }
                    });
                    if (username === tournament.winner)
                        TournamentsWon++;
                    else
                        TournamentsLost++;
                    parsedGames.forEach((game) => {
                        var _a, _b;
                        if (((_a = game.playerDetails.player1) === null || _a === void 0 ? void 0 : _a.id) === userId || ((_b = game.playerDetails.player2) === null || _b === void 0 ? void 0 : _b.id) === userId) {
                            if (game.duration) {
                                timePlayed += game.duration;
                            }
                        }
                    });
                });
                // console.log("TournamentsWon:", TournamentsWon);
                // console.log("TournamentsLost:", TournamentsLost);
                // console.log("TournamentsPlayed:", tournamentsPlayed);
                // console.log("TimePlayed:", timePlayed);
                // console.log("userStats in getPongTournamentStats:", userStats);
                // Update the HTML content with the tournament stats /////////////////////////////////////////////////////////////////////////////
                if (userStats) {
                    try {
                        const statsContainer = document.getElementById("pong-tournament-stats-content");
                        const selectionElement = document.getElementById("stats_select");
                        let htmlContent = statsContainer ? statsContainer.innerHTML : '';
                        if (statsContainer) {
                            statsContainer.innerHTML = ''; // Clear previous content			
                            htmlContent = htmlContent
                                .replace("{{ tournamentsPlayed }}", tournamentsPlayed.toString())
                                .replace("{{ t_wins }}", TournamentsWon.toString())
                                .replace("{{ t_losses }}", TournamentsLost.toString())
                                .replace("{{ timePlayed }}", (formatTimeFromMilliseconds(timePlayed)).toString());
                            statsContainer.innerHTML = htmlContent;
                            // userStats.unshift(userIDElement); // Re-add the userId element to the start of the array
                            // console.log("userStats after unshift:", userStats);
                            // console.log("type of userStats:", typeof userStats);
                            // console.log("htmlContent:", htmlContent);
                            const proccessedStats = {
                                userId: userId,
                                username: username,
                                tournamentsPlayed: tournamentsPlayed,
                                TournamentsWins: TournamentsWon,
                                Tournamentslosses: TournamentsLost,
                                timePlayed: (formatTimeFromMilliseconds(timePlayed)).toString(),
                                userStats: userStats
                            };
                            handlePongTournamentStats(proccessedStats);
                        }
                    }
                    catch (error) {
                        console.log("Error loading HTML file:", error);
                        appElement.innerHTML = `<div id="pong-container">An error occurred while generating the content</div>`;
                    }
                }
                //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            }
        }
        catch (error) {
            console.log("Error rendering Pong TournamentStats element:", error);
            appElement.innerHTML = `<div id="pong-container">An error occurred while generating the content</div>`;
        }
    });
}
export function getChessStats(appElement) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const url = `https://localhost:8443/back/get_user_chessgamelogs`;
            const getUserResponse = yield fetch(`${url}`, {
                method: "GET",
                credentials: "include"
            });
            if (!getUserResponse.ok) {
                throw new Error("Error retrieving stats");
            }
            const userStats = yield getUserResponse.json();
            if (userStats) {
                try {
                    const statsContainer = document.getElementById("chess-stats-content");
                    const selectionElement = document.getElementById("stats_select");
                    let htmlContent = statsContainer ? statsContainer.innerHTML : '';
                    if (statsContainer) {
                        statsContainer.innerHTML = ''; // Clear previous content			
                        htmlContent = htmlContent
                            .replace("{{ totalGames }}", userStats.totalGames.toString())
                            .replace("{{ wins }}", userStats.wins.toString())
                            .replace("{{ losses }}", userStats.losses.toString())
                            .replace("{{ draws }}", userStats.draws.toString())
                            .replace("{{ WinsByCheckMate }}", userStats.WinsByCheckMate.toString())
                            .replace("{{ lostByCheckMate }}", userStats.lostByCheckMate.toString());
                        statsContainer.innerHTML = htmlContent;
                        handleChessStats(userStats);
                    }
                }
                catch (error) {
                    console.log("Error loading HTML file:", error);
                    appElement.innerHTML = `<div id="pong-container">An error occurred while generating the content</div>`;
                }
            }
        }
        catch (error) {
            console.log("Error rendering Stats element:", error);
            appElement.innerHTML = `<div id="pong-container">An error occurred while generating the content</div>`;
        }
    });
}
