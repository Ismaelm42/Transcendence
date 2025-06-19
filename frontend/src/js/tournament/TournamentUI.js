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
                        playerTournamentName.textContent = ` ${player.gameplayer.tournamentUsername.charAt(0).toUpperCase()}${player.gameplayer.tournamentUsername.slice(1).toLowerCase()}`;
                        PlayerRegisterHTMLContainer.appendChild(playerItem);
                    }
                });
            }
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
            "tournamnet-info-container"
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
                    this.tournament.setPendingPlayersCount(numberOfPlayers - 1);
                    console.log("numberOfPlayers set to:", numberOfPlayers);
                    console.log("scoreLimit set to:", scoreLimit);
                    console.log("Difficulty set to:", this.tournament.getTournamentConfig().difficulty);
                    console.log("Tournament config set:", JSON.stringify(this.tournament.getTournamentConfig()));
                    this.showOnly('tournamnet-info-container');
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
        // const preparePlayers = (numberOfPlayers: number): void => {
        // 	this.tournament.setEmptyTournamentPlayers(numberOfPlayers);
        // 	getFirstPlayer();
        // 	console.log ("Pendingplayers desde prepare players: ", this.tournament.getPendingPlayersCount());
        // 	console.log("Preparing players for tournament with number of players: ", numberOfPlayers);
        // 	for (let i : number = 1; i <= numberOfPlayers; i++) {
        // 		console.log("Preparing player card for player: ", i + 1);
        // 		const playersContainer = document.getElementById('select-player-container');
        // 		// // const playerContainer = document.getElementById('player-container');
        // 		if (playersContainer )
        // 		{				
        // 			playersContainer.style.display = "block";
        // 			new PlayerCard(i+1, playersContainer);
        // 		}
        // 	}	
        // }
        // const getFirstPlayer = async (): Promise<void> => {
        // 	try
        // 	{
        // 		const response = await fetch("https://localhost:8443/back//verify_first_player", {
        // 			method: "POST",
        // 			credentials: 'include',	
        // 		});
        // 		const result = await response.json();
        // 		if (!response.ok)
        // 		{
        // 			console.log(`Error: ${result.message}`);
        // 		}
        // 		else{
        // 			const playerOne: GamePlayer = {
        // 				id: result.id,
        // 				username: result.username,
        // 				tournamentUsername: result.tournamentUsername,
        // 				email: result.email,
        // 				avatarPath: result.avatarPath
        // 			};
        // 			this.tournament.setTournamentPlayer( 0,'ready', playerOne);
        // 			// Esta llamada hay que repetirla para cada jugador que se registre
        // 			this.renderRegisteredPlayers(this.tournament.getTournamentPlayers());
        // 		}
        // 	}
        // 	catch (error){
        // 		console.error("Error while verifying:", error);
        // 	}
        // }
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
        // this.tournament.setEmptyTournamentPlayers(numberOfPlayers);
        this.getFirstPlayer();
        console.log("Pending players desde preparePlayers:", this.tournament.getPendingPlayersCount());
        console.log("Preparing players for tournament with number of players:", numberOfPlayers);
        this.getNextPlayer();
    }
    getNextPlayer() {
        const numberOfPlayers = this.tournament.getTournamentConfig().numberOfPlayers;
        const numberOfPendingPlayers = this.tournament.getPendingPlayersCount();
        if (numberOfPendingPlayers === 0) {
            this.launchTournament(this.tournament); // No pending players to prepare
        }
        let i = this.tournament.addTournamentPlayer.length;
        const playersContainer = document.getElementById('select-player-container');
        if (playersContainer) {
            playersContainer.style.display = "block";
            new PlayerCard(i + 1, playersContainer);
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
        // incluir lógica para lanzar el torneo
        console.log("Launching tournament:");
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
}
// 		// Configuration panel elements
// 		this.setupConfigPanelListeners();
// 		// Start game button
// 		document.getElementById('start-game')?.addEventListener('click', () => {
// 			this.launchGame();
// 		});
// 		// Back button - returns to lobby
// 		document.getElementById('back-button')?.addEventListener('click', () => {
// 			this.showOnly('select-game');
// 		});
// 	}
// 	/**
// 	 * Set up listeners for the configuration panel elements
// 	 */
// 	private setupConfigPanelListeners(): void
// 	{
// 		// Score limit slider
// 		const scoreSlider = document.getElementById('score-limit') as HTMLInputElement;
// 		const scoreValue = document.getElementById('score-value');
// 		if (scoreSlider && scoreValue)
// 		{
// 			scoreSlider.addEventListener('input', () => {
// 				const value = scoreSlider.value;
// 				scoreValue.textContent = value;
// 				this.game.getGameConfig().scoreLimit = parseInt(value);
// 			});
// 		}
// 		// Difficulty slider
// 		const difficultySlider = document.getElementById('difficulty') as HTMLInputElement;
// 		const difficultyValue = document.getElementById('difficulty-value');
// 		if (difficultySlider && difficultyValue)
// 		{
// 			difficultySlider.addEventListener('input', () => {
// 				const value = parseInt(difficultySlider.value);
// 				let difficultyText = 'Medium';
// 				let difficultyLevel: 'easy' | 'medium' | 'hard' = 'medium';
// 				if (value === 1)
// 				{
// 					difficultyText = 'Easy';
// 					difficultyLevel = 'easy';
// 				}
// 				else if (value === 3)
// 				{
// 					difficultyText = 'Hard';
// 					difficultyLevel = 'hard';
// 				}
// 				difficultyValue.textContent = difficultyText;
// 				this.game.getGameConfig().difficulty = difficultyLevel;
// 			});
// 		}
// 	}
// 	private setupPlayer2LoginPanel(): void
// 	{
// 		const	loginPanel = document.getElementById('player2-login-panel');
// 		const	configPanel = document.getElementById('config-panel');
// 		const	loginForm = document.getElementById('player2-login-form') as HTMLFormElement;
// 		const	guestBtn = document.getElementById('player2-guest-btn');
// 		const	errorMsg = document.getElementById('player2-login-error');
// 		if (!loginPanel || !loginForm || !guestBtn || !configPanel)
// 			return;
// 		// Handle registered user login
// 		loginForm.onsubmit = async (e) => {
// 			e.preventDefault();
// 			const email = (document.getElementById('player2-email') as HTMLInputElement).value;
// 			const password = (document.getElementById('player2-password') as HTMLInputElement).value;
// 			const success = await this.game.getGameConnection().checkPlayer({ email, password });
// 			if (!email || !password)
// 			{
// 				if (errorMsg)
// 					errorMsg.textContent = 'Please enter both email and password';
// 				return;
// 			}
// 			if (success)
// 			{
// 				this.game.setPlayerInfo('player2', { email, password });
// 				this.showOnly('config-panel');
// 				if (errorMsg) errorMsg.textContent = '';
// 			}
// 			else
// 				if (errorMsg) errorMsg.textContent = 'Invalid email or password. Please try again';
// 		};
// 		// Handle guest
// 		guestBtn.onclick = () => {
// 			this.game.setGuestInfo('player2', 'guest');
// 			this.showOnly('config-panel');
// 			if (errorMsg)
// 				errorMsg.textContent = '';
// 		};
// 	}
// 	launchGame(): void 
// 	{
// 		if (!this.game.getGameConnection().socket || !this.game.getGameConnection().connectionStat)
// 		{
// 			console.error("Cannot join game: connection not ready");
// 			return ;
// 		}
// 		this.game.setGameConfig(this.game.getGameConfig());
// 		this.game.getGameConnection().joinGame(this.game.getGameLog().mode);
// 	}
