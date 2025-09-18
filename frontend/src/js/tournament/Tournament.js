var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { showMessage, showWinnerMessage } from '../modal/showMessage.js';
import Game from '../game/Game.js';
import { SPA } from '../spa/spa.js';
import { Step } from '../spa/stepRender.js';
import { TournamentUI } from '../tournament/TournamentUI.js';
// import { game } from '../game/Game.js';
// Default container ID (I think i should match HTML file)
const DEFAULT_CONTAINER_ID = "tournament-container";
export default class Tournament extends Step {
    /*********** CONSTRUCTOR ***************/
    constructor(containerId = DEFAULT_CONTAINER_ID) {
        super(containerId);
        this.tournamentId = -42;
        this.tournamentPlayers = [];
        this.tournamentConfig = { numberOfPlayers: 4, scoreLimit: 5, difficulty: 'medium' };
        this.bracket = [];
        this.gameDataArray = [];
        this.tournamentPendingPlayers = this.tournamentConfig.numberOfPlayers;
        this.nextGameIndex = 0; // Index to track the next game to be played
        this.TournamentWinner = null; // To store the tournament winner
        this.LeaveWithoutWarningFLAG = false;
        this.ui = new TournamentUI(this);
        // todo: check and complete. at thismoment is initialized as empty object and filled in saveTournament()
        this.log = {};
        this.game = new Game(DEFAULT_CONTAINER_ID, "tournament-game");
    }
    setTournamentId(tournamentId) {
        this.tournamentId = tournamentId;
    }
    getTournamentId() {
        return this.tournamentId;
    }
    getTournamentUI() {
        return this.ui;
    }
    findNextTournamentId() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch("https://localhost:8443/back/get_next_tournamentlog", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const data = yield response.json();
                if (response.ok) {
                    console.log("Tournament get id successfully:", data);
                    if (data && data.nextTournamentlogId) {
                        this.tournamentId = data.nextTournamentlogId;
                        console.log("Next tournament ID available:", this.tournamentId);
                        return data.nextTournamentlogId; // insert the functionto retrieve next tournament ID available
                    }
                }
            }
            catch (error) {
                console.error("Error while retrieving next tournament ID:", error);
            }
            return -1; // Return -1 or any other value to indicate an error or no ID available
        });
    }
    resumeTournament() {
        console.log("Resuming tournament from tournament.resumeTournament:");
        // 1. Asegúrate de que el contenedor principal existe y está limpio
        const appContainer = document.getElementById('app-container');
        console.log("limpiamos appContainer");
        history.pushState(null, "", "#tournament-lobby");
        // TODO: Pedro esta llamada relanzaría la protección al volver de game-match
        this.ui.enableTournamentHashGuard();
        ////////////////////////////////////////////////////////////////////////////
        if (appContainer) {
            appContainer.innerHTML = '';
            // Crea el contenedor del bracket si no existe
            let bracketNode = document.getElementById('tournament-bracket-container');
            if (!bracketNode) {
                bracketNode = document.createElement('div');
                bracketNode.id = 'tournament-bracket-container';
                bracketNode.style.display = 'block';
                appContainer.appendChild(bracketNode);
            }
        }
        // 2. Muestra solo el bracket
        this.ui.showOnly('tournament-bracket-container');
        // 3. Renderiza el bracket actualizado con los jugadores y ganadores actuales
        // const players = this.getTournamentPlayers().map(tp => tp.gameplayer);
        // this.ui.updateRenderBracket(players);
        // // 4. (Opcional) Si necesitas mostrar la siguiente partida, renderízala también
        // const bracketContainer = document.getElementById('tournament-bracket-container');
        // if (bracketContainer) {
        // 	this.displayCurrentMatch();
        // }
    }
    saveTournament() {
        return __awaiter(this, void 0, void 0, function* () {
            this.log = {
                tournamentId: this.tournamentId,
                playerscount: this.tournamentPlayers.length,
                config: this.tournamentConfig,
                users: this.tournamentPlayers,
                gamesData: this.gameDataArray,
                winner: this.TournamentWinner ? this.TournamentWinner : null
            };
            try {
                const response = yield fetch("https://localhost:8443/back/update_tournamentlog", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(this.log),
                });
                const data = yield response.json();
                if (response.ok) {
                    console.log("Tournament Information saved successfully:");
                    return 0;
                }
            }
            catch (error) {
                console.error("Error while saving tournament Information:", error);
            }
            return -1; // Return -1 or any other value to indicate an error or no ID available
        });
    }
    render(appElement) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ui.initializeUI(appElement);
        });
    }
    setTournamentConfig(config) {
        this.tournamentConfig = config;
        // this.log.config = config;
    }
    getTournamentConfig() {
        return this.tournamentConfig;
    }
    setEmptyTournamentPlayers(numberOfPlayers) {
        this.tournamentPlayers = [];
        for (let i = 0; i < numberOfPlayers; i++) {
            this.tournamentPlayers.push({
                Index: i.toString(),
                status: 'pending', // 
                gameplayer: { id: 0, username: '', tournamentUsername: '', email: '', avatarPath: '' } // Assuming GamePlayer has these properties
            });
        }
    }
    checkTournamentPlayers() {
        if (this.tournamentPlayers.length === 0) {
            console.warn("No players in the ");
            return false;
        }
        for (const player of this.tournamentPlayers) {
            if (player.status === 'pending') {
                return false;
            }
        }
        return true;
    }
    getTournamentPlayers() {
        return this.tournamentPlayers;
    }
    /**
     * Convierte un array de GamePlayer en un array de TournamentPlayer,
     * asignando status 'ready' y el índice correspondiente.
     */
    gamePlayersToTournamentPlayers(gamePlayers) {
        if (!Array.isArray(gamePlayers)) {
            console.error("gamePlayersToTournamentPlayers: input is not an array", gamePlayers);
            return [];
        }
        return gamePlayers.map((gp, idx) => ({
            Index: idx.toString(),
            status: 'ready',
            gameplayer: gp
        }));
    }
    getTournamentPlayerByIndex(index) {
        const player = this.tournamentPlayers[index];
        return player && player.gameplayer && player.gameplayer.id ? [player] : null;
    }
    setTournamentPlayer(index, status, player) {
        this.tournamentPlayers[index].status = status;
        this.tournamentPlayers[index].gameplayer = player;
    }
    addTournamentPlayer(player) {
        console.log("Adding player to tournament:", player);
        if (this.tournamentPlayers.length < this.tournamentConfig.numberOfPlayers) {
            console.log("Adding player to tournament: dentro del if");
            player.Index = this.tournamentPlayers.length.toString(); // Assign an ID based on the current length
            player.status = 'ready'; // Default status for new players
            this.tournamentPlayers.push(player);
            this.tournamentPendingPlayers--;
        }
        else {
            console.warn("Cannot add more players, tournament is full.");
        }
        console.log("Current tournament players: ", this.tournamentPlayers.length);
        console.log("Pending players count: ", this.tournamentPendingPlayers);
    }
    getPendingPlayersCount() {
        return this.tournamentPendingPlayers;
    }
    setPendingPlayersCount(count) {
        this.tournamentPendingPlayers = count;
    }
    getGameDataArray() {
        return this.gameDataArray;
    }
    addGameData(gameData) {
        //TODO: Comproar si es necesario limitarlo y si se así hacerlo por case de 4 6 8 y elnúmero de partidas 
        // (3 para 4 ; 5 o 6 Si el jugador que pasa cuanta como game data; 7)
        // if (!gameData || !gameData.id || !gameData.mode || !gameData.player1 || !gameData.player2) {
        // 	console.error("Invalid game data provided:", gameData);
        // 	return;
        // }
        // if (this.gameDataArray.length == this.tournamentConfig.numberOfPlayers) {
        // 	console.warn("Game data array is already full. Cannot add more game data.");
        // 	return;
        // }
        this.gameDataArray.push(gameData);
        console.log("Game data added to tournament:", gameData);
        console.log("Current game data array length:", this.gameDataArray.length);
    }
    // public returnMode(player1: GamePlayer, player2: GamePlayer): string {
    // 	// return'auto'; // HARDCODED FOR TESTING PURPOSES
    // 	//TODO: descomentar y eliminar return 'auto';
    // 	console.log("Returning mode for players:", player1, player2);
    // 	if (player1.email.includes('ai') && player1.email.includes('@transcendence.com') 
    // 			&& player2.email.includes('ai') && player2.email.includes('@transcendence.com')) {
    // 		return 'auto';
    // 	} else if ((player1.email.includes('ai') && player1.email.includes('@transcendence.com')) 
    // 			|| ( player2.email.includes('ai') && player2.email.includes('@transcendence.com'))) {
    // 		return '1vAI';
    // 	} else {
    // 		return '1v1';
    // 	}
    // }
    returnMode(player1, player2) {
        /**TODO: if we asign a id !== -1 to any Ai player revieew this function */
        console.log("Returning mode for players:", player1, player2);
        if (player1.id === -1 && player2.id === -1) {
            return 'auto';
        }
        else if (player1.id === -1 || player2.id === -1) {
            return '1vAI';
        }
        else {
            return '1v1';
        }
    }
    initialGameData(player1Index, player2Index) {
        if (player1Index > -1) {
            var mode = this.returnMode(this.bracket[player1Index], this.bracket[player2Index]);
            var player1 = this.bracket[player1Index];
            var player2 = this.bracket[player2Index];
        }
        else {
            mode = '';
            player1 = { id: 0, username: '', tournamentUsername: '', email: '', avatarPath: '' };
            player2 = { id: 0, username: '', tournamentUsername: '', email: '', avatarPath: '' };
        }
        var id = this.tournamentId + "-match-" + (this.gameDataArray.length + 1);
        // id correction to control rare matches
        if (player1Index === -42)
            id = this.tournamentId + '-final';
        if (player1Index === -21)
            id = this.tournamentId + '-Bye';
        let newGameData = {
            id: id,
            mode: mode,
            playerDetails: { player1: player1, player2: player2, },
            startTime: Date.now(),
            config: {
                scoreLimit: this.tournamentConfig.scoreLimit,
                difficulty: this.tournamentConfig.difficulty
            },
            result: {
                winner: '',
                loser: '',
                score: [0, 0],
                endReason: ''
            },
            duration: 0,
            tournamentId: this.tournamentId,
            readyState: false
        };
        this.addGameData(newGameData);
    }
    /**
     *
     * @param bracket Array of TournamentPlayer objects
     * Using the bracket info we get the gamedata for each initial game and save the tournament in DB
     * @returns Promise<void>
     * @throws Error if the bracket is invalid or if saving the tournament fails
     */
    setTournamentBracket(bracket) {
        return __awaiter(this, void 0, void 0, function* () {
            this.bracket = []; // Reset bracket to avoid duplicates if called multiple times
            for (const player of bracket) {
                if (!player.gameplayer) {
                    console.error("Invalid player data in bracket:", player);
                    throw new Error("Invalid player data in bracket");
                }
                else {
                    this.bracket.push(player.gameplayer);
                }
            }
            console.log("Setting tournament bracket with players:", this.bracket);
            if (this.tournamentId === -42) {
                const id = yield this.findNextTournamentId();
                const saved = yield this.saveTournament();
                if (id !== -1 && saved === 0) {
                    this.setTournamentId(id);
                    console.log("Tournament ID set to:", this.tournamentId);
                    switch (this.tournamentConfig.numberOfPlayers) {
                        case 4:
                            console.log("Initializing game data for 4 players.");
                            console.log('tournamentId', this.tournamentId);
                            this.initialGameData(0, 1);
                            this.initialGameData(2, 3);
                            this.initialGameData(-42, -1); // Final match
                            break;
                        case 6:
                            this.initialGameData(0, 1);
                            this.initialGameData(2, 3);
                            this.initialGameData(4, 5);
                            this.initialGameData(-1, -1);
                            this.initialGameData(-21, -1); // Bye game 
                            this.initialGameData(-42, -1); // Final match
                            break;
                        case 8:
                            this.initialGameData(0, 1);
                            this.initialGameData(2, 3);
                            this.initialGameData(4, 5);
                            this.initialGameData(6, 7);
                            this.initialGameData(-1, -1);
                            this.initialGameData(-1, -1);
                            this.initialGameData(-42, -1); // Final match
                            break;
                    }
                }
                else {
                    console.error("Failed to set tournament ID.");
                    throw new Error("Failed to set tournament ID");
                }
            }
            else {
                switch (this.bracket.length) {
                    case 4:
                        console.log("Initializing game data for 4 players.");
                        console.log('tournamentId', this.tournamentId);
                        this.initialGameData(0, 1);
                        this.initialGameData(2, 3);
                        this.initialGameData(-42, -1); //Final match
                        break;
                    case 6:
                        this.initialGameData(0, 1);
                        this.initialGameData(2, 3);
                        this.initialGameData(4, 5);
                        this.initialGameData(-1, -1);
                        this.initialGameData(-21, -1); // Bye game 
                        this.initialGameData(-42, -1); //Final match
                        break;
                    case 8:
                        this.initialGameData(0, 1);
                        this.initialGameData(2, 3);
                        this.initialGameData(4, 5);
                        this.initialGameData(6, 7);
                        this.initialGameData(-1, -1);
                        this.initialGameData(-1, -1);
                        this.initialGameData(-42, -1); //Final match
                        break;
                }
            }
            const savedData = yield this.saveTournament();
            if (savedData !== 0) {
                console.error("Failed to savedItitialGameData");
                throw new Error("Failed to savedItitialGameData");
            }
        });
    }
    launchTournament(tournament) {
        return __awaiter(this, void 0, void 0, function* () {
            // incluir lógica para lanzar el torneo
            const tounamentData = {
                Tid: this.getTournamentId(),
                Players: this.getTournamentPlayers(),
                Tconfig: this.getTournamentConfig()
            };
            console.log("Launching tournament: ", JSON.stringify(tounamentData));
            this.ui.showOnly('tournament-container');
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
                    yield this.setTournamentBracket(data);
                    console.log("Tournament bracket set successfully:", this.bracket);
                    this.ui.renderBracket(data);
                    yield new Promise(resolve => setTimeout(resolve, 5000));
                    const spa = SPA.getInstance();
                    spa.currentGame = this.game;
                    yield this.game.getGameConnection().establishConnection();
                    const launchBtn = document.getElementById('launch-match-btn');
                    if (launchBtn)
                        launchBtn.addEventListener('click', () => this.launchNextMatch());
                    this.displayCurrentMatch();
                }
            }
            catch (error) {
                console.error("Error while preparing the tournament bracket:", error);
            }
            finally {
                this.ui.showOnly('tournament-bracket-container');
            }
        });
    }
    getNextGameIndex() {
        return this.nextGameIndex;
    }
    setNextGameIndex(index) {
        this.nextGameIndex = index;
        console.log("Next game index set to:", this.nextGameIndex);
    }
    displayCurrentMatch() {
        var _a, _b, _c, _d, _e, _f;
        const panel = document.getElementById('current-match-panel');
        if (!panel || !this.gameDataArray)
            return;
        const match = this.gameDataArray[this.nextGameIndex];
        if (!match) {
            panel.innerHTML = "<p>No more matches.</p>";
            return;
        }
        panel.innerHTML = `
		<div class="bg-gray-800 border-2 border-[#00ff99] rounded-xl shadow-lg p-6 max-w-md mx-auto my-8 text-white">
			<h3 class="text-[#00ff99] text-xl font-bold mb-4 text-center tracking-wide">Current Match</h3>
			<div class="flex items-center justify-center gap-8 mb-4">
				<div class="flex flex-col items-center">
					<img src="${((_a = match.playerDetails.player1) === null || _a === void 0 ? void 0 : _a.avatarPath) || '/images/default-avatar.png'}" alt="Avatar" class="w-14 h-14 rounded-full border-2 border-[#00ff99] mb-2">
					<span class="font-semibold">${(_b = match.playerDetails.player1) === null || _b === void 0 ? void 0 : _b.username}</span>
				</div>
				<span class="text-2xl font-bold text-[#00ff99]">VS</span>
				<div class="flex flex-col items-center">
					<img src="${((_c = match.playerDetails.player2) === null || _c === void 0 ? void 0 : _c.avatarPath) || '/images/default-avatar.png'}" alt="Avatar" class="w-14 h-14 rounded-full border-2 border-[#00ff99] mb-2">
					<span class="font-semibold">${(_d = match.playerDetails.player2) === null || _d === void 0 ? void 0 : _d.username}</span>
				</div>
			</div>
			<div class="flex justify-between text-sm text-gray-300 mb-2">
				<span>Match ID:</span>
				<span class="font-medium text-white">${match.id}</span>
			</div>
			<div class="flex justify-between text-sm text-gray-300">
				<span>Score Limit:</span>
				<span class="font-medium text-white">${(_e = match.config) === null || _e === void 0 ? void 0 : _e.scoreLimit}</span>
				<span class="ml-4">Difficulty:</span>
				<span class="font-medium text-white">${(_f = match.config) === null || _f === void 0 ? void 0 : _f.difficulty}</span>
			</div>
		</div>
	`;
    }
    // "Recycle" game instance with current match data and launchGame, which will
    // start the game API workflow and go to match-render step
    launchNextMatch() {
        var _a, _b, _c, _d;
        if (this.bracket && this.nextGameIndex < this.gameDataArray.length && this.game) {
            const matchData = this.gameDataArray[this.nextGameIndex];
            if (matchData.id.includes('Bye')) {
                matchData.result = {
                    winner: ((_a = matchData.playerDetails.player1) === null || _a === void 0 ? void 0 : _a.id.toString()) || '',
                    loser: "0",
                    score: [5, 0],
                    endReason: 'Game ended'
                };
                showMessage(`${(_b = matchData.playerDetails.player1) === null || _b === void 0 ? void 0 : _b.tournamentUsername} passes to next round`, 5000); //replace with the funtion do display the winner
                this.nextGameIndex++;
                this.handleMatchResult(matchData);
            }
            else if (matchData.mode === 'auto') {
                // Simulate a random winner (1 or 2 with equal probability)
                const winnerIndex = Math.random() < 0.5 ? 0 : 1;
                const winner = winnerIndex === 0 ? matchData.playerDetails.player1 : matchData.playerDetails.player2;
                const loser = winnerIndex === 0 ? matchData.playerDetails.player2 : matchData.playerDetails.player1;
                if (!winner || !loser) {
                    console.error("Invalid winner or loser data:", winner, loser);
                    return;
                }
                matchData.result = {
                    winner: winner.username,
                    loser: loser.username,
                    score: winnerIndex === 0 ? [((_c = matchData.config) === null || _c === void 0 ? void 0 : _c.scoreLimit) || 5, 0] : [0, ((_d = matchData.config) === null || _d === void 0 ? void 0 : _d.scoreLimit) || 5],
                    endReason: 'Game ended'
                };
                matchData.readyState = true;
                this.nextGameIndex++;
                const nameToDisplay = winner.tournamentUsername || winner.username || 'Unknown';
                //TODO: replace with the function to display the Match winner
                console.log("matchData.id: " + matchData.id);
                if (!matchData.id.includes('final')) {
                    showMessage(`${nameToDisplay} wins!`, null);
                }
                this.handleMatchResult(matchData);
            }
            else {
                // TODO: Pedro esta llamada anularía la protección en hame-match //
                this.ui.disableTournamentHashGuard();
                ///////////////////////////////////////////////////////////////////
                this.game.setGameLog(matchData);
                if (matchData.config)
                    this.game.setGameConfig(matchData.config);
                const spa = SPA.getInstance();
                spa.currentGame = this.game;
                this.game.getGameUI().launchGame();
                this.nextGameIndex++;
                this.displayCurrentMatch();
            }
        }
    }
    // Todo: Pedro - this method should be called from the game step when the match is finished
    /**
    * Handles the match result, updates the tournament bracket, and increments the currentMatchIndex.
    * @param result - The result of the match containing player data and result information.
    */
    handleMatchResult(result) {
        // Aux method -> Update bracket, increment currentMatchIndex, etc.
        if (!result || !result.result || !result.playerDetails.player1 || !result.playerDetails.player2) {
            console.error("Invalid match result data:", result);
            return;
        }
        console.log("Handling match result:", result);
        console.log("el array de partidas es", this.gameDataArray);
        this.updateTournamentBracket(result);
    }
    /** TODO: This update function could be modified so that it only makes the call
    *   and retrieves the information from the database, if the match can be updated without
    *   depending on the frontend. That way, it would be harder to modify the results
    *   with POST requests; in other words, the backend would handle updating the info and the frontend would only display it.
    */
    updateTournamentBracket(result) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //result = game to update
                // Sanitize gameDataArray to ensure all objects are serializable
                // ... copy the gameDataArray to avoid mutating the original array
                const gamesData = this.gameDataArray.map(game => (Object.assign(Object.assign({}, game), { player1: Object.assign({}, game.playerDetails.player1), player2: Object.assign({}, game.playerDetails.player2), config: game.config ? Object.assign({}, game.config) : undefined, result: game.result ? Object.assign({}, game.result) : undefined })));
                const payload = { result: result, gamesData: gamesData, playerscount: this.tournamentConfig.numberOfPlayers };
                const response = yield fetch("https://localhost:8443/back/updateBracket", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                });
                const data = yield response.json();
                console.log("updateTournamentBracket: Response data:", data);
                if (response.ok) {
                    //todo: it is posible to improve the way we receive the array of GamePlayers
                    let winnerPlayer = null;
                    if (result.result && result.result.winner) {
                        winnerPlayer = this.bracket.find(player => player.username === result.result.winner);
                        if (winnerPlayer) {
                            this.bracket.push(winnerPlayer);
                        }
                    }
                    this.gameDataArray = data.gamesData;
                    console.log("updateTournamentBracket: Updated gameDataArray:", this.gameDataArray);
                    if (result.id.includes('final')) {
                        // Todo: replace with the function to display the tournament winner if we want to improve it
                        showWinnerMessage(`${winnerPlayer ? winnerPlayer.tournamentUsername : 'Unknown'}`, null);
                        const appContainer = document.getElementById('app-container');
                        if (appContainer) {
                            appContainer.innerHTML = '';
                            this.navigate('tournament-lobby');
                            this.ui.disableTournamentHashGuard();
                        }
                        return;
                    }
                    this.ui.updateRenderBracket(this.bracket);
                    // await new Promise(resolve => setTimeout(resolve, 5000));
                    while (true) {
                        const launchBtn = document.getElementById('launch-match-btn');
                        if (launchBtn) {
                            launchBtn.addEventListener('click', () => this.launchNextMatch());
                            break;
                        }
                        else {
                            yield new Promise(resolve => setTimeout(resolve, 50)); // Wait for 1
                        }
                    }
                    this.displayCurrentMatch();
                }
            }
            catch (error) {
                console.error("Error while preparing the tournament bracket:", error);
            }
            finally {
                this.ui.showOnly('tournament-bracket-container');
            }
        });
    }
    getBracket() {
        return this.bracket;
    }
    deleteTempUsers(TournamentId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Deleting temporary users for Tournament ID:", TournamentId);
            if (TournamentId === -42) {
                return;
            }
            try {
                const response = yield fetch("https://localhost:8443/back/delete_user_by_tournament_id", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ TournamentId: TournamentId.toString() }),
                });
                if (response.ok) {
                    console.log("Temporary users deleted successfully for Tournament ID:", TournamentId);
                }
                else {
                    console.log("Failed to delete temporary users for Tournament ID:", TournamentId);
                }
            }
            catch (error) {
                console.log("Error while deleting temporary users:", error);
            }
        });
    }
    static deleteTournamentTempUsers(TournamentId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Deleting temporary users for Tournament ID:", TournamentId);
            if (TournamentId === -42) {
                return;
            }
            try {
                const response = yield fetch("https://localhost:8443/back/delete_user_by_tournament_id", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ TournamentId: TournamentId.toString() }),
                });
                if (response.ok) {
                    console.log("Temporary users deleted successfully for Tournament ID:", TournamentId);
                }
                else {
                    console.error("Failed to delete temporary users for Tournament ID:", TournamentId);
                }
            }
            catch (error) {
                console.error("Error while deleting temporary users:", error);
            }
        });
    }
    resetTournament() {
        this.deleteTempUsers(this.tournamentId).then(() => {
            console.log("Temporary users deleted successfully.");
        }).catch((error) => {
            console.error("Error while deleting temporary users:", error);
        });
        this.tournamentId = -42;
        this.tournamentPlayers = [];
        // TODO_GAME: check if this is necessary
        this.game = new Game(DEFAULT_CONTAINER_ID, "tournament-game");
        //TODO_GAME: check if this is necessary
        // this.ui = new TournamentUI(this);
        this.tournamentConfig = { numberOfPlayers: 4, scoreLimit: 5, difficulty: 'medium' };
        this.bracket = [];
        this.gameDataArray = [];
        this.tournamentPendingPlayers = this.tournamentConfig.numberOfPlayers;
        this.nextGameIndex = 0; // Reset the next game index
        this.TournamentWinner = null; // Reset the tournament Winner
        this.log = {};
    }
}
