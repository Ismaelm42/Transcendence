/**
 * GameUI.ts -> UI setup and event listeners
 */

import { SPA } from '../spa/spa.js';
import Tournament from './Tournament.js'
import { TournamentConfig, TournamentPlayer } from './types.js';
import { PlayerCard } from './playerCard.js'; 
import { GamePlayer } from '../game/types.js';
import { showMessage } from '../modal/showMessage.js';
import Game from '../game/Game.js';
import { GameUI } from '../game/GameUI.js';

const DEFAULT_CONTAINER_ID = "tournament-container";

// Assuming you have a utility function to prepare players
export class TournamentUI
{
	private	tournament: Tournament;

	constructor(tournament: Tournament)
	{
		this.tournament = tournament;
	}

	showOnly(divId: string, displayStyle: string = "block") : void
	{
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
			const	checkDiv = document.getElementById(id);
			if (checkDiv)
				checkDiv.style.display = (id === divId) ? displayStyle : "none";
		});
	}

	async initializeUI(appElement: HTMLElement): Promise<void>
	{
		try
		{
			const response = await fetch("../../html/tournament/tournamentUI.html");
			if (!response.ok)
				throw new Error("Failed to load the tournament UI HTML file");
			const htmlContent = await response.text();
			appElement.innerHTML = htmlContent;
		}
		catch (error)
		{
			console.error("Error loading game UI:", error);
			appElement.innerHTML = `<div class="error-container">Failed to load tournament interface. Please try again.</div>`;
		}
		this.setupEventListeners();
	}

	// Sets up event listeners for game mode buttons, which after will also set controllers
	setupEventListeners()
	{
		console.log("Setting up tournament UI event listeners");
		// Game mode buttons
		document.getElementById('localTournament')?.addEventListener('click', async () => {
			this.showOnly('local-tournament-form');
			// Número de jugadores
			const numberSlider = document.getElementById("tournament-number-of-players") as HTMLInputElement | null;
			const numberValue = document.getElementById("tournament-number-of-players-value") as HTMLElement | null;
			if (numberSlider && numberValue) {
				numberValue.textContent = numberSlider.value;
				numberSlider.addEventListener("input", () => {
					numberValue.textContent = numberSlider.value;
				});
			}

			// Score limit
			const scoreSlider = document.getElementById("tournament-score-limit") as HTMLInputElement | null;
			const scoreValue = document.getElementById("tournament-score-value") as HTMLElement | null;
			if (scoreSlider && scoreValue) {
				scoreValue.textContent = scoreSlider.value;
				scoreSlider.addEventListener("input", () => {
					scoreValue.textContent = scoreSlider.value;
				});
			}

			// Dificultad
			const difficultySlider = document.getElementById("tournament-difficulty") as HTMLInputElement | null;
			const difficultyValue = document.getElementById("tournament-difficulty-value") as HTMLElement | null;
			const difficultyLabels = ["Easy", "Medium", "Hard"];
			if (difficultySlider && difficultyValue) {
				difficultyValue.textContent = difficultyLabels[parseInt(difficultySlider.value) - 1];
				difficultySlider.addEventListener("input", () => {
					difficultyValue.textContent = difficultyLabels[parseInt(difficultySlider.value) - 1];
				});
			}
			const selectPlayers = document.getElementById("select-players") as HTMLButtonElement | null;
			if (selectPlayers) {
				selectPlayers.addEventListener("click", (e) => {
					e.preventDefault();
					let numberOfPlayers = parseInt(numberSlider?.value || "4");
					let scoreLimit = parseInt(scoreSlider?.value || "5");

					console.log("difficultySlider.value:", difficultySlider?.value);
					// Difficulty slider
					if (!difficultySlider) {
						console.error("Difficulty slider not found");
						return;
					}
					const value = parseInt(difficultySlider?.value);
					let difficultyLevel: 'easy' | 'medium' | 'hard' = 'medium';
					if (value === 1){
						difficultyLevel = 'easy';
					}else if (value === 3)							{
						difficultyLevel = 'hard';
					}
					let tConfig = {numberOfPlayers:numberOfPlayers, scoreLimit: scoreLimit, difficulty: difficultyLevel} as TournamentConfig;							
					console.log("Tconfig set:", JSON.stringify(tConfig));
					this.tournament.setTournamentConfig(tConfig);
					this.tournament.setPendingPlayersCount(numberOfPlayers);
					console.log("numberOfPlayers set to:", numberOfPlayers);
					console.log("scoreLimit set to:", scoreLimit);
					console.log("Difficulty set to:", this.tournament.getTournamentConfig().difficulty);
					console.log("Tournament config set:", JSON.stringify(this.tournament.getTournamentConfig()));
					this.showOnly('tournament-info-container');
					
					const sumaryPlayersHtml = document.getElementById('summary-players')
					const sumaryScoreHtml = document.getElementById('summary-score')
					const sumaryDifficultHtml = document.getElementById('summary-difficulty')
					if (sumaryPlayersHtml && sumaryScoreHtml && sumaryDifficultHtml) {
						sumaryPlayersHtml.textContent = `Number of Players: ${numberOfPlayers}`;
						sumaryScoreHtml.textContent = `Score Limit: ${scoreLimit}`;
						sumaryDifficultHtml.textContent = `Difficulty: ${this.tournament.getTournamentConfig().difficulty}`;
					} else {
						console.error("Summary elements not found");
					}
					console.log("Preparing players for tournament with number of players: ", numberOfPlayers);
						this.preparePlayers(numberOfPlayers);
					});
				
			}
		});
		document.getElementById('remoteTournament')?.addEventListener('click', async () => {
			// await this.game.setPlayerInfo('player1', null);
			// this.game.setGuestInfo('player2', 'ai');
			// this.game.setGameMode('1vAI');
			this.showOnly('tournament-config-panel');
		});
	
		document.getElementById('searchTournament')?.addEventListener('click', async () => {
			// Lobby + diff player entry assignation
			// await this.game.setPlayerInfo('player1', null);
			// this.game.setGameMode('remote');
			this.showOnly('tournament-config-panel');
		});

	}

	async preparePlayers(numberOfPlayers: number): Promise<void> {
		// this.tournament.setEmptyTournamentPlayers(numberOfPlayers);
		await this.getFirstPlayer();
		console.log("Pending players desde preparePlayers:", this.tournament.getPendingPlayersCount());
		console.log("Preparing players for tournament with number of players:", numberOfPlayers);
		this.getNextPlayer();
	}

	getNextPlayer(): void {
		const numberOfPlayers = this.tournament.getTournamentConfig().numberOfPlayers;
		const numberOfPendingPlayers = this.tournament.getPendingPlayersCount();
		if (numberOfPendingPlayers === 0) {
			this.tournament.launchTournament(this.tournament); // No pending players to prepare
		}
		
		const players = this.tournament.getTournamentPlayers();
		console.log("Current tournament players:", players);
		console.log("Jugadores (JSON):", JSON.stringify(players));

		let i = players.length + 1;
		const playersContainer = document.getElementById('select-player-container');
		if (playersContainer) {
			playersContainer.innerHTML = ''; // Clear previous content
			playersContainer.style.display = "block";
			const playerCard = new PlayerCard(
				i,
				playersContainer,
				this.tournament.getTournamentId() !== null ? this.tournament.getTournamentId()!.toString() : undefined
			);
			playerCard.onPlayerFilled = async (tournamentPlayer: TournamentPlayer, selectedOption: number) => {
				console.log("Player card filled for player:", tournamentPlayer.gameplayer.email);
				if (selectedOption === 1) {
					const playerEmail = document.getElementById(`players-email-${tournamentPlayer.Index}`) as HTMLInputElement;
					const playerPassword = document.getElementById(`players-password-${tournamentPlayer.Index}`) as HTMLInputElement;
					if (this.checkRepeatedPlayer(null, playerEmail.value)) {
						showMessage("Duplicate player, please choose a different one.", null);
						playerEmail.value = '';
						playerPassword.value = '';
						return; 
					}
					const playerData = await this.checkPlayer(i, playerEmail.value, playerPassword.value);
					if (playerData) {
						console.log("Player data received:", playerData);
						tournamentPlayer.gameplayer = playerData.gameplayer;
						tournamentPlayer.status = 'ready';
					} else {
						showMessage("Invalid email or password.", null);
						return; 
					}
				} else if (selectedOption === 2) {
					const guestTournamentName = document.getElementById(`guest-tournament-name-${tournamentPlayer.Index}`) as HTMLInputElement;
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
					else
					{	
					if (this.checkRepeatedPlayer(guestTournamentName.value, null)) {
							showMessage("Tournament Name not available, please choose a different one.", null);
							guestTournamentName.value = '';
							return; // Exit if the player is already registered
						}

						const guestData = await this.checkGuestPlayer(i, guestTournamentName.value);
						console.log("Guest data received:", guestData);
						if (guestData) {
							tournamentPlayer.gameplayer = guestData.gameplayer;
							tournamentPlayer.status = 'ready';
						} else {
							showMessage("Tournament name already exists", null);
							guestTournamentName.value = '';
							return; // Exit if the guest is not valid
						}
					}
				} else if (selectedOption === 3) {// AI 
					tournamentPlayer.gameplayer = {
						id: `${tournamentPlayer.Index} + 5`,
						username: `Ai00${tournamentPlayer.Index}`,
						tournamentUsername: `Ai00${tournamentPlayer.Index}`,
						email: `ai${tournamentPlayer.Index}@transcendence.com`,
						avatarPath: `https://localhost:8443/back/images/avatar-1${i}.png`
					};
					tournamentPlayer.status = 'ready';
				}

					playersContainer.innerHTML = ''; // Clear previous content
					this.tournament.addTournamentPlayer(playerCard.tournamentPlayer);
					this.renderRegisteredPlayers(this.tournament.getTournamentPlayers());
					if(this.tournament.getTournamentPlayers().length < numberOfPlayers) {
						this.getNextPlayer();
					}else 
					{
						console.log("All players are ready. Launching tournament.");
						await this.tournament.launchTournament(this.tournament);	
					}

			};
		}
	
	}

	// Todo: pendiente de probar en la final
	getTournamentRoundName(): string {
		const nextGameIndex = this.tournament.getNextGameIndex();
		const playersCount = this.tournament.getTournamentConfig().numberOfPlayers;

		let roundName = `Match\u00A0${nextGameIndex + 1}`;
		let finalIndex = -1;

		// Determine the final match index based on the number of players
		if (playersCount === 4) {
			finalIndex = 2; // 2 semis (0,1) + 1 final (2)
		} else if (playersCount === 6) {
			finalIndex = 4; // 4 quarters (0-3) + 1 semi (4) + 1 final (5) -> but usually 5 matches, adjust as needed
		} else if (playersCount === 8) {
			finalIndex = 6; // 4 quarters (0-3) + 2 semis (4,5) + 1 final (6)
		}
		if (nextGameIndex === finalIndex) {
			roundName = "Final";
		}
		return roundName;
	}

	renderNextMatchInfo(appElement: HTMLElement): void {

		this.loadTemplate('../../html/tournament/nextMatch.html').then(nextMatchHtml => {
			let parsed = nextMatchHtml;

			const gameDataArray = this.tournament.getGameDataArray();
			const player1 = gameDataArray[this.tournament.getNextGameIndex()].player1;
			const player2 = gameDataArray[this.tournament.getNextGameIndex()].player2;

			if (!player1 || !player2) {
				console.error("Player data is missing for next match.");
				return;
			}
			parsed = parsed
				// .replace(new RegExp(`roundName`, 'g'), player1.tournamentUsername)
				.replace('{{ roundName }}', this.getTournamentRoundName())
				.replace(new RegExp(`nextPlayer-1.tournamentName`, 'g'), player1.tournamentUsername)
				.replace(new RegExp(`nextPlayer-1.avatar`, 'g'), player1.avatarPath)
				.replace(new RegExp(`nextPlayer-2.tournamentName`, 'g'), player2.tournamentUsername)
				.replace(new RegExp(`nextPlayer-2.avatar`, 'g'), player2.avatarPath);

			const wrapper = document.createElement('div');
			wrapper.className = 'next-match-bracket';
			wrapper.innerHTML = parsed;
			appElement.appendChild(wrapper);
		});
		
	}

	// todo: Pendiente de ver en actualizacones de torneo
	renderBracket(data: any): void {
		  const appElement = document.getElementById('tournament-bracket-container');
		  if (!appElement) {
		   console.error("Tournament bracket container not found");
		   return;
		  }
		  var html_Bracket_template = `../../html/tournament/bracket-template-${data.length}.html`;
				// var html_Bracket_template =  `../../html/tournament/bracket-template-3.html`;
				this.loadTemplate(html_Bracket_template).then(BracketHtml => {
					let parsed = BracketHtml;
					for (let i = 0; i < data.length; i++) {
						const player = data[i];
						parsed = parsed
							.replace(new RegExp(`player-${i + 1}\\.tournamentName`, 'g'), player.gameplayer.tournamentUsername)
							.replace(new RegExp(`player-${i + 1}\\.avatar`, 'g'), player.gameplayer.avatarPath);
					}
					const wrapper = document.createElement('div');
					wrapper.className = 'tournament-bracket';
					wrapper.innerHTML = parsed;
					appElement.appendChild(wrapper);
					this.renderNextMatchInfo(appElement);
				});
	}
			
		/**
		 * Updates the tournament bracket UI with the latest data.
		 * This method clears the previous bracket and renders the new one.
		 * @param data Array of TournamentPlayer objects representing the current bracket state.
		 */
	async updateRenderBracket(data: GamePlayer[]): Promise<void> {
			const appElement = document.getElementById('tournament-bracket-container');
		
			if (!appElement) {
				console.error("Tournament bracket container not found");
				return;
			}
			appElement.innerHTML = ''
			const numberOfPlayers = this.tournament.getTournamentConfig().numberOfPlayers;
			const html_Bracket_template = `../../html/tournament/bracket-template-${numberOfPlayers}.html`;
			this.loadTemplate(html_Bracket_template).then(BracketHtml => {
				let parsed = BracketHtml;
				console.log("Bracket data:", JSON.stringify(data));
				console.log("Bracket data length:", data.length);
				console.log(typeof data);
				// Iterar por los jugadores
				for (let i = 0; i < Object.keys(data).length; i++) {
					const player = data[i];
					if (i < numberOfPlayers) {
						parsed = parsed
							.replace(new RegExp(`player-${i + 1}\\.tournamentName`, 'g'), player.tournamentUsername)
							.replace(new RegExp(`player-${i + 1}\\.avatar`, 'g'), player.avatarPath);
					}else{
						var matchIndex;
						if (numberOfPlayers === 6 && i === 10) {
							matchIndex = 3
							
						}else
						{
							matchIndex = i - numberOfPlayers + 1; // Adjust index for matches
						}
							parsed = parsed.replace(new RegExp(`winner Match ${matchIndex}`, 'g'), data[i].tournamentUsername);
							console.log(`winner_match_{matchIndex}_img`, `winner_match_${matchIndex}_img`);
							// Replace the src attribute for the winner's avatar directly in the HTML template
							parsed = parsed.replace(
								new RegExp(`(<img[^>]*id=["']winner_match_${matchIndex}_img["'][^>]*src=["'])[^"']*(['"][^>]*>)`),
								`$1${data[i].avatarPath}$2`
							);
					}
				}
				const wrapper = document.createElement('div');
				wrapper.className = 'tournament-bracket';
				wrapper.innerHTML = parsed;
				appElement.appendChild(wrapper);
				this.renderNextMatchInfo(appElement);
			});
	}

	async getFirstPlayer(): Promise<void> {
		try {
			const response = await fetch("https://localhost:8443/back//verify_first_player", {
				method: "POST",
				credentials: 'include',
			});
			const result = await response.json();
			if (!response.ok) {
				console.log(`Error: ${result.message}`);
			} else {
				const playerOne: GamePlayer = {
					id: result.id,
					username: result.username,
					tournamentUsername: result.tournamentUsername,
					email: result.email,
					avatarPath: result.avatarPath
				};
				// this.tournament.setTournamentPlayer(0, 'ready', playerOne);
				const tournamentPlayer: TournamentPlayer = {
					Index: '',
					status: 'ready',
					gameplayer: playerOne
				};
				this.tournament.addTournamentPlayer(tournamentPlayer);
				this.renderRegisteredPlayers(this.tournament.getTournamentPlayers());
			}
		} catch (error) {
			console.error("Error while verifying:", error);
		}
	}
	/**
	 * Hay que darle el formato al componente para mostrar ya sea haciendo un pequeño componente con su html y sus clases, incluyendo más css aquí o con el archivo css**/
	public renderRegisteredPlayers = (players: TournamentPlayer[]): void => {
		const PlayerRegisterHTMLContainer = document.getElementById('registered-players');

		if (!PlayerRegisterHTMLContainer) {
			console.error("Player register HTML container not found");
			return;
		}
		else
		{
			PlayerRegisterHTMLContainer.innerHTML = ''; // Clear previous content
			players.forEach((player) => {
				if (player.status === 'ready' ){	//Condicionar al modo en remoto para el cambio de ready a waiting si se hace finalmente
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

	public checkRepeatedPlayer = (tournamentName:string | null, email:string | null): boolean => {
	
		const players = this.tournament.getTournamentPlayers();
		for (const player of players) {
			if (email && player.gameplayer.email === email) {
				return true; // Player with the same email already exists
			}
			if (tournamentName && player.gameplayer.tournamentUsername === tournamentName) {
				return true; // Player with the same email already exists
			}
		}
		return false; // No player with the same email found
	}

	async checkGuestPlayer(index: number, guestTournamentName: string): Promise<TournamentPlayer | null> {
		console.log(`Guest Player en checkguestPlayer: ${index} name: ${guestTournamentName}`);
		console.log("Checking int torunamentId:", this.tournament.getTournamentId());
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
		} else {
			const guestData = { tournamentId: this.tournament.getTournamentId(), tournamentName: guestTournamentName };
			try {
				const response = await fetch("https://localhost:8443/back/verify_guest_tournamentName", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(guestData),
				});
				const result = await response.json();
				if (!response.ok) {
					showMessage(`Error: ${result.error}`, null);
					return null;
				}
				this.tournament.setTournamentId(result.tournamentId);
				// if (this.tournament.getTournamentId() === -42 && !result.tournamentId) {
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
			} catch (error) {
				console.error("Error while verifying:", error);
				return null;
			}
		}
	}
	async checkPlayer(index: number, email: string | null, password: string | null): Promise<TournamentPlayer | null> {
		const data = { email, password };
		try {
			const response = await fetch("https://localhost:8443/back/verify_tounament_user", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});
			const result = await response.json();
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
		} catch (error) {
			console.error("Error while verifying:", error);
			return null;
		}
	}

	private async loadTemplate(template:string): Promise<string> {
	  	const response = await fetch(template);
	  return await response.text();
	}
}
