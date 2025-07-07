/**
 * GameUI.ts -> UI setup and event listeners
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PlayerCard } from './playerCard.js';
import { showMessage } from '../modal/showMessage.js';
const DEFAULT_CONTAINER_ID = "tournament-container";
// Assuming you have a utility function to prepare players
export class TournamentUI {
    constructor(tournament) {
        /**
         * Hay que darle el formato al componente para mostrar ya sea haciendo un pequeño componente con su html y sus clases, incluyendo más css aquí o con el archivo css**/
        this.renderRegisteredPlayers = (players) => {
            const PlayerRegisterHTMLContainer = document.getElementById('registered-players');
            if (!PlayerRegisterHTMLContainer) {
                console.error("Player register HTML container not found");
                return;
            }
            else {
                PlayerRegisterHTMLContainer.innerHTML = ''; // Clear previous content
                players.forEach((player) => {
                    if (player.status === 'ready') { //Condicionar al modo en remoto para el cambio de ready a waiting si se hace finalmente
                        const playerItem = document.createElement('li');
                        playerItem.classList.add('flex', 'flex-row');
                        const avatarImg = document.createElement('img');
                        avatarImg.src = player.gameplayer.avatarPath || 'default-avatar.png'; // Use a default avatar if none is provided
                        avatarImg.alt = `Avatar of Player ${player.Index}`;
                        avatarImg.className = 'player-avatar';
                        avatarImg.style.maxWidth = '2rem';
                        avatarImg.style.height = 'auto';
                        playerItem.appendChild(avatarImg);
                        playerItem.className = 'player-item';
                        const playerTournamentName = document.createElement('span');
                        playerTournamentName.className = 'player-tournament-name';
                        playerItem.appendChild(playerTournamentName);
                        // Capitalize the first letter of the tournament username
                        // and make the rest lowercase
                        playerTournamentName.textContent = ` ${player.gameplayer.tournamentUsername}`;
                        PlayerRegisterHTMLContainer.appendChild(playerItem);
                    }
                });
            }
        };
        this.checkRepeatedPlayer = (tournamentName, email) => {
            const players = this.tournament.getTournamentPlayers();
            for (const player of players) {
                // console.log("Checking player:", player.gameplayer.tournamentUsername, player.gameplayer.email);
                // console.log("Checking against:", tournamentName, email);
                if (email && player.gameplayer.email === email) {
                    return true; // Player with the same email already exists
                }
                if (tournamentName && player.gameplayer.tournamentUsername === tournamentName) {
                    return true; // Player with the same email already exists
                }
            }
            return false; // No player with the same email found
        };
        this.tournament = tournament;
    }
    showOnly(divId, displayStyle = "block") {
        const divIndex = [
            'select-tournament',
            'tournament-config-panel',
            'tournament-container',
            'tournament-results',
            'local-tournament-form',
            "tournament-info-container",
            "tournament-bracket-container"
        ];
        divIndex.forEach(id => {
            const checkDiv = document.getElementById(id);
            if (checkDiv)
                checkDiv.style.display = (id === divId) ? displayStyle : "none";
        });
    }
    initializeUI(appElement) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch("../../html/tournament/tournamentUI.html");
                if (!response.ok)
                    throw new Error("Failed to load the tournament UI HTML file");
                const htmlContent = yield response.text();
                appElement.innerHTML = htmlContent;
            }
            catch (error) {
                console.error("Error loading game UI:", error);
                appElement.innerHTML = `<div class="error-container">Failed to load tournament interface. Please try again.</div>`;
            }
            this.setupEventListeners();
        });
    }
    // Sets up event listeners for game mode buttons, which after will also set controllers
    setupEventListeners() {
        var _a, _b, _c;
        console.log("Setting up tournament UI event listeners");
        // Game mode buttons
        (_a = document.getElementById('localTournament')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
            this.showOnly('local-tournament-form');
            // Número de jugadores
            const numberSlider = document.getElementById("tournament-number-of-players");
            const numberValue = document.getElementById("tournament-number-of-players-value");
            if (numberSlider && numberValue) {
                numberValue.textContent = numberSlider.value;
                numberSlider.addEventListener("input", () => {
                    numberValue.textContent = numberSlider.value;
                });
            }
            // Score limit
            const scoreSlider = document.getElementById("tournament-score-limit");
            const scoreValue = document.getElementById("tournament-score-value");
            if (scoreSlider && scoreValue) {
                scoreValue.textContent = scoreSlider.value;
                scoreSlider.addEventListener("input", () => {
                    scoreValue.textContent = scoreSlider.value;
                });
            }
            // Dificultad
            const difficultySlider = document.getElementById("tournament-difficulty");
            const difficultyValue = document.getElementById("tournament-difficulty-value");
            const difficultyLabels = ["Easy", "Medium", "Hard"];
            if (difficultySlider && difficultyValue) {
                difficultyValue.textContent = difficultyLabels[parseInt(difficultySlider.value) - 1];
                difficultySlider.addEventListener("input", () => {
                    difficultyValue.textContent = difficultyLabels[parseInt(difficultySlider.value) - 1];
                });
            }
            const selectPlayers = document.getElementById("select-players");
            if (selectPlayers) {
                selectPlayers.addEventListener("click", (e) => {
                    e.preventDefault();
                    let numberOfPlayers = parseInt((numberSlider === null || numberSlider === void 0 ? void 0 : numberSlider.value) || "4");
                    let scoreLimit = parseInt((scoreSlider === null || scoreSlider === void 0 ? void 0 : scoreSlider.value) || "5");
                    console.log("difficultySlider.value:", difficultySlider === null || difficultySlider === void 0 ? void 0 : difficultySlider.value);
                    // Difficulty slider
                    if (!difficultySlider) {
                        console.error("Difficulty slider not found");
                        return;
                    }
                    const value = parseInt(difficultySlider === null || difficultySlider === void 0 ? void 0 : difficultySlider.value);
                    let difficultyLevel = 'medium';
                    if (value === 1) {
                        difficultyLevel = 'easy';
                    }
                    else if (value === 3) {
                        difficultyLevel = 'hard';
                    }
                    let tConfig = { numberOfPlayers: numberOfPlayers, scoreLimit: scoreLimit, difficulty: difficultyLevel };
                    console.log("Tconfig set:", JSON.stringify(tConfig));
                    this.tournament.setTournamentConfig(tConfig);
                    this.tournament.setPendingPlayersCount(numberOfPlayers);
                    console.log("numberOfPlayers set to:", numberOfPlayers);
                    console.log("scoreLimit set to:", scoreLimit);
                    console.log("Difficulty set to:", this.tournament.getTournamentConfig().difficulty);
                    console.log("Tournament config set:", JSON.stringify(this.tournament.getTournamentConfig()));
                    this.showOnly('tournament-info-container');
                    const sumaryPlayersHtml = document.getElementById('summary-players');
                    const sumaryScoreHtml = document.getElementById('summary-score');
                    const sumaryDifficultHtml = document.getElementById('summary-difficulty');
                    if (sumaryPlayersHtml && sumaryScoreHtml && sumaryDifficultHtml) {
                        sumaryPlayersHtml.textContent = `Number of Players: ${numberOfPlayers}`;
                        sumaryScoreHtml.textContent = `Score Limit: ${scoreLimit}`;
                        sumaryDifficultHtml.textContent = `Difficulty: ${this.tournament.getTournamentConfig().difficulty}`;
                    }
                    else {
                        console.error("Summary elements not found");
                    }
                    console.log("Preparing players for tournament with number of players: ", numberOfPlayers);
                    this.preparePlayers(numberOfPlayers);
                });
            }
        }));
        (_b = document.getElementById('remoteTournament')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
            // await this.game.setPlayerInfo('player1', null);
            // this.game.setGuestInfo('player2', 'ai');
            // this.game.setGameMode('1vAI');
            this.showOnly('tournament-config-panel');
        }));
        (_c = document.getElementById('searchTournament')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
            // Lobby + diff player entry assignation
            // await this.game.setPlayerInfo('player1', null);
            // this.game.setGameMode('remote');
            this.showOnly('tournament-config-panel');
        }));
    }
    preparePlayers(numberOfPlayers) {
        return __awaiter(this, void 0, void 0, function* () {
            // this.tournament.setEmptyTournamentPlayers(numberOfPlayers);
            yield this.getFirstPlayer();
            console.log("Pending players desde preparePlayers:", this.tournament.getPendingPlayersCount());
            console.log("Preparing players for tournament with number of players:", numberOfPlayers);
            this.getNextPlayer();
        });
    }
    getNextPlayer() {
        const numberOfPlayers = this.tournament.getTournamentConfig().numberOfPlayers;
        const numberOfPendingPlayers = this.tournament.getPendingPlayersCount();
        if (numberOfPendingPlayers === 0) {
            this.launchTournament(this.tournament); // No pending players to prepare
        }
        const players = this.tournament.getTournamentPlayers();
        console.log("Current tournament players:", players);
        console.log("Jugadores (JSON):", JSON.stringify(players));
        let i = players.length + 1;
        // console.log("this.tournament.getTournamentPlayers.length:_____________", players.length);
        // console.log("numberOfPlayers:_____________", numberOfPlayers);
        // console.log("numberOfPendingPlayers:_____________", numberOfPendingPlayers);
        // console.log("Preparing player card for player:_____________", i);
        const playersContainer = document.getElementById('select-player-container');
        if (playersContainer) {
            playersContainer.innerHTML = ''; // Clear previous content
            playersContainer.style.display = "block";
            const playerCard = new PlayerCard(i, playersContainer, this.tournament.getTournamentId() !== null ? this.tournament.getTournamentId().toString() : undefined);
            playerCard.onPlayerFilled = (tournamentPlayer, selectedOption) => __awaiter(this, void 0, void 0, function* () {
                console.log("Player card filled for player:", tournamentPlayer.gameplayer.email);
                if (selectedOption === 1) {
                    const playerEmail = document.getElementById(`players-email-${tournamentPlayer.Index}`);
                    const playerPassword = document.getElementById(`players-password-${tournamentPlayer.Index}`);
                    if (this.checkRepeatedPlayer(null, playerEmail.value)) {
                        showMessage("Duplicate player, please choose a different one.", null);
                        playerEmail.value = '';
                        playerPassword.value = '';
                        return;
                    }
                    const playerData = yield this.checkPlayer(i, playerEmail.value, playerPassword.value);
                    if (playerData) {
                        console.log("Player data received:", playerData);
                        tournamentPlayer.gameplayer = playerData.gameplayer;
                        tournamentPlayer.status = 'ready';
                    }
                    else {
                        showMessage("Invalid email or password.", null);
                        return;
                    }
                }
                else if (selectedOption === 2) {
                    const guestTournamentName = document.getElementById(`guest-tournament-name-${tournamentPlayer.Index}`);
                    if (!guestTournamentName || guestTournamentName.value.trim() === '') {
                        tournamentPlayer.gameplayer = {
                            id: '',
                            username: '',
                            tournamentUsername: `Guest00${i}`,
                            email: '',
                            avatarPath: `https://localhost:8443/back/images/avatar-${i}.png`
                        };
                        tournamentPlayer.status = 'ready';
                    }
                    else {
                        if (this.checkRepeatedPlayer(guestTournamentName.value, null)) {
                            showMessage("Tournament Name not available, please choose a different one.", null);
                            guestTournamentName.value = '';
                            return; // Exit if the player is already registered
                        }
                        const guestData = yield this.checkGuestPlayer(i, guestTournamentName.value);
                        console.log("Guest data received:", guestData);
                        if (guestData) {
                            tournamentPlayer.gameplayer = guestData.gameplayer;
                            tournamentPlayer.status = 'ready';
                        }
                        else {
                            showMessage("Tournament name already exists", null);
                            guestTournamentName.value = '';
                            return; // Exit if the guest is not valid
                        }
                    }
                }
                else if (selectedOption === 3) { // AI 
                    tournamentPlayer.gameplayer = {
                        id: '',
                        username: `Ai${tournamentPlayer.Index}`,
                        tournamentUsername: `Ai${tournamentPlayer.Index}`,
                        email: `ai${tournamentPlayer.Index}@transcendence.com`,
                        avatarPath: `https://localhost:8443/back/images/avatar-1${i}.png`
                    };
                    tournamentPlayer.status = 'ready';
                }
                playersContainer.innerHTML = ''; // Clear previous content
                this.tournament.addTournamentPlayer(playerCard.tournamentPlayer);
                this.renderRegisteredPlayers(this.tournament.getTournamentPlayers());
                if (this.tournament.getTournamentPlayers().length < numberOfPlayers) {
                    this.getNextPlayer();
                }
                else {
                    console.log("All players are ready. Launching tournament.");
                    yield this.launchTournament(this.tournament);
                }
            });
        }
        // numberOfPlayers
        // for (let i = 1; i <= numberOfPlayers; i++) {
        // 	console.log("Preparing player card for player:", i + 1);
        // 	const playersContainer = document.getElementById('select-player-container');
        // 	if (playersContainer) {
        // 		playersContainer.style.display = "block";
        // 		new PlayerCard(i + 1, playersContainer);
        // 		}
        // 	}
        // }
    }
    launchTournament(tournament) {
        return __awaiter(this, void 0, void 0, function* () {
            // incluir lógica para lanzar el torneo
            const tounamentData = {
                Tid: tournament.getTournamentId(),
                Players: tournament.getTournamentPlayers(),
                Tconfig: tournament.getTournamentConfig()
            };
            console.log("Launching tournament: ", JSON.stringify(tounamentData));
            this.showOnly('tournament-container');
            try {
                const response = yield fetch("https://localhost:8443/back/prepareBracket", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(tounamentData),
                });
                const data = yield response.json();
                if (response.ok) {
                    // const FirsGameui = new GameUI(new Game());
                    console.log("Tournament bracket prepared successfully:", data);
                    this.tournament.setTournamentBracket(data);
                    this.renderBracket(data);
                    yield new Promise(resolve => setTimeout(resolve, 5000));
                    console.log("Antes de new GameFirst game log set:");
                    console.log("this.tournament.getGameDataArray", JSON.stringify(this.tournament.getGameDataArray()));
                    // let gameconfig 
                    // // const firstGame = new Game();
                    // const firstGame = new Game(DEFAULT_CONTAINER_ID, "tournament-game");
                    // firstGame.setGameMode('1v1');
                    // const firstGameData=
                    // {
                    // 	id: "game-" + Date.now(),
                    // 	mode: '1v1',
                    // 	player1: this.tournament.getTournamentPlayers()[0].gameplayer,
                    // 	player2: this.tournament.getTournamentPlayers()[1].gameplayer,
                    // 	startTime: Date.now(),
                    // 	config: tounamentData.Tconfig,
                    // 	result: {winner: '', loser: '', score: [0, 0] as [number, number]},
                    // 	duration: 0,
                    // 	tournamentId: tounamentData.Tid ? tounamentData.Tid : 0,
                    // 	readyState: true
                    // }
                    // firstGame.setGameLog(firstGameData);
                    // firstGame.setGameConfig({
                    // 	scoreLimit: tounamentData.Tconfig.scoreLimit,
                    // 	difficulty: tounamentData.Tconfig.difficulty
                    // });
                    // const	spa = SPA.getInstance();
                    // spa.currentGame = firstGame;
                    // firstGame.getGameUI().launchGame();
                    // 	const panel = document.getElementById('current-match-panel');
                    // 	if (!panel || !this.tournament.getGameDataArray())
                    // 		return;
                    // 	const match = firstGameData;
                    // 	if (!match)
                    // 	{
                    // 		panel.innerHTML = "<p>No more matches.</p>";
                    // 		return;
                    // 	}
                    // 	panel.innerHTML = `
                    // 	<div class="bg-gray-800 border-2 border-[#00ff99] rounded-xl shadow-lg p-6 max-w-md mx-auto my-8 text-white">
                    // 		<h3 class="text-[#00ff99] text-xl font-bold mb-4 text-center tracking-wide">Current Match</h3>
                    // 		<div class="flex items-center justify-center gap-8 mb-4">
                    // 			<div class="flex flex-col items-center">
                    // 				<img src="${match.player1?.avatarPath || '/images/default-avatar.png'}" alt="Avatar" class="w-14 h-14 rounded-full border-2 border-[#00ff99] mb-2">
                    // 				<span class="font-semibold">${match.player1?.username}</span>
                    // 			</div>
                    // 			<span class="text-2xl font-bold text-[#00ff99]">VS</span>
                    // 			<div class="flex flex-col items-center">
                    // 				<img src="${match.player2?.avatarPath || '/images/default-avatar.png'}" alt="Avatar" class="w-14 h-14 rounded-full border-2 border-[#00ff99] mb-2">
                    // 				<span class="font-semibold">${match.player2?.username}</span>
                    // 			</div>
                    // 		</div>
                    // 		<div class="flex justify-between text-sm text-gray-300 mb-2">
                    // 			<span>Match ID:</span>
                    // 			<span class="font-medium text-white">${match.id}</span>
                    // 		</div>
                    // 		<div class="flex justify-between text-sm text-gray-300">
                    // 			<span>Score Limit:</span>
                    // 			<span class="font-medium text-white">${match.config?.scoreLimit}</span>
                    // 			<span class="ml-4">Difficulty:</span>
                    // 			<span class="font-medium text-white">${match.config?.difficulty}</span>
                    // 		</div>
                    // 	</div>
                    // `;
                    // this.showOnly('game-container');
                    // await firstGame.getGameConnection().establishConnection().then(() => {
                    // 	console.log("Game connection established for first game.");
                    // 	firstGame.getGameUI().launchGame();
                    // 	console.log("First game launched with players:", firstGame.getGameLog().player1, firstGame.getGameLog().player2);
                    // });
                    // console.log("First game log set:", firstGame.getGameLog());
                    // // firstGame.setTournamentId(tounamentData.Tid? tounamentData.Tid : 0);
                    // firstGame.setTournamentPlayers(
                    // 	tounamentData.Players[0].gameplayer, tounamentData.Players[1].gameplayer);
                    // }
                    // if (!response.ok) {
                    // 	console.error("Error preparing tournament bracket:", data.message);
                    // 	showMessage(`Error: ${data.message}`, null);
                    // 	return;
                    // }
                    // console.log("Tournament bracket prepared successfully:", data);
                    // const appElement = document.getElementById('tournament-bracket-container');
                    // if (!appElement) {
                    // 	console.error("Tournament bracket container not found");
                    // 	return;
                    // }tournamentId
                    // appElement.innerHTML = `
                    // 	<div id="pong-container">
                    // 		<h2>Tournament Bracket</h2>
                    // 		<div id="tournament-bracket">
                    // 			<!-- Aquí se generará el bracket del torneo -->
                    // 			${data.bracketHtml}
                    // 		</div>
                    // 	</div>
                    // `;
                }
            }
            catch (error) {
                console.error("Error while preparing the tournament bracket:", error);
            }
            finally {
                this.showOnly('tournament-bracket-container');
            }
            // if (!tournament.checkTournamentPlayers()) {
            // 	console.error("Cannot start tournament: not all players are ready");
            // 	return;
            // }
            // 	tournament.setTournamentData({
            // 		id: 'tournament-' + Date.now(),
            // 		mode: 'local',
            // 		players: tournament.getTournamentPlayers().map(player => player.gameplayer),
            // 		startTime: Date.now(),
            // 		config: tournament.getTournamentConfig(),
            // 		result: null,
            // 		gameIds: [],
            // 		readyState: true
            // 	} as TournamentData);
            // 	console.log("Tournament started with data:", tournament.getTournamentData());
            // 	this.showOnly('tournament-container');
            // 	this.renderRegisteredPlayers(tournament.getTournamentPlayers());
            // }
        });
    }
    renderBracket(data) {
        const appElement = document.getElementById('tournament-bracket-container');
        if (!appElement) {
            console.error("Tournament bracket container not found");
            return;
        }
        var html_Brackert_template = `../../html/tournament/bracket-template-${data.length}.html`;
        // var html_Brackert_template =  `../../html/tournament/bracket-template-3.html`;
        this.loadTemplate(html_Brackert_template).then(BracketHtml => {
            let parsed = BracketHtml;
            for (let i = 0; i < data.length; i++) {
                const player = data[i];
                parsed = parsed
                    .replace(new RegExp(`player-${i + 1}\\.tounamentName`, 'g'), player.gameplayer.tournamentUsername)
                    .replace(new RegExp(`player-${i + 1}\\.avatar`, 'g'), player.gameplayer.avatarPath);
            }
            const wrapper = document.createElement('div');
            wrapper.className = 'tournament-bracket';
            wrapper.innerHTML = parsed;
            appElement.appendChild(wrapper);
        });
    }
    getFirstPlayer() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch("https://localhost:8443/back//verify_first_player", {
                    method: "POST",
                    credentials: 'include',
                });
                const result = yield response.json();
                if (!response.ok) {
                    console.log(`Error: ${result.message}`);
                }
                else {
                    const playerOne = {
                        id: result.id,
                        username: result.username,
                        tournamentUsername: result.tournamentUsername,
                        email: result.email,
                        avatarPath: result.avatarPath
                    };
                    // this.tournament.setTournamentPlayer(0, 'ready', playerOne);
                    const tournamentPlayer = {
                        Index: '',
                        status: 'ready',
                        gameplayer: playerOne
                    };
                    this.tournament.addTournamentPlayer(tournamentPlayer);
                    this.renderRegisteredPlayers(this.tournament.getTournamentPlayers());
                }
            }
            catch (error) {
                console.error("Error while verifying:", error);
            }
        });
    }
    checkGuestPlayer(index, guestTournamentName) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Guest Player en checkguestPlayer: ${index} name: ${guestTournamentName}`);
            if (!guestTournamentName || guestTournamentName.trim() === '') {
                const AvatarPath = `https://localhost:8443/back/images/avatar-${index}.png`;
                return {
                    Index: '',
                    status: 'ready',
                    gameplayer: {
                        id: '',
                        username: '',
                        tournamentUsername: '',
                        email: '',
                        avatarPath: AvatarPath
                    }
                };
            }
            else {
                const guestData = { tournamentId: this.tournament.getTournamentId(), tournamentName: guestTournamentName };
                try {
                    const response = yield fetch("https://localhost:8443/back/verify_guest_tournamentName", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(guestData),
                    });
                    const result = yield response.json();
                    if (!response.ok) {
                        showMessage(`Error: ${result.error}`, null);
                        return null;
                    }
                    return {
                        Index: '',
                        status: 'ready',
                        gameplayer: {
                            id: '',
                            username: '',
                            tournamentUsername: guestTournamentName,
                            email: '',
                            avatarPath: result.avatarPath
                        }
                    };
                }
                catch (error) {
                    console.error("Error while verifying:", error);
                    return null;
                }
            }
        });
    }
    checkPlayer(index, email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = { email, password };
            try {
                const response = yield fetch("https://localhost:8443/back/verify_tounament_user", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                });
                const result = yield response.json();
                if (!response.ok) {
                    showMessage(`Error: ${result.message}`, null);
                    return null;
                }
                return {
                    Index: index.toString(),
                    status: 'ready',
                    gameplayer: {
                        id: result.id,
                        username: result.username,
                        tournamentUsername: result.tournamentUsername,
                        email: result.email,
                        avatarPath: result.avatarPath
                    }
                };
            }
            catch (error) {
                console.error("Error while verifying:", error);
                return null;
            }
        });
    }
    loadTemplate(template) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(template);
            return yield response.text();
        });
    }
}
