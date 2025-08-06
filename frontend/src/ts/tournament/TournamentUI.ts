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
		// this.boundOnLeavingTournamentLobby = this.onLeavingTournamentLobby.bind(this);
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

			// Show the select players 				
			const selectPlayers = document.getElementById("select-players") as HTMLButtonElement | null;
			if (selectPlayers) {
			    selectPlayers.replaceWith(selectPlayers.cloneNode(true)); // Delete previous listeners 
			    const newSelectPlayers = document.getElementById("select-players") as HTMLButtonElement | null;
			    newSelectPlayers?.addEventListener("click", (e) => {
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
					this.tournament.setTournamentConfig(tConfig);
					this.tournament.setPendingPlayersCount(numberOfPlayers);
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
					console.log("InAddEevnlisteners - Preparing players for tournament with number of players: ", numberOfPlayers);
						this.preparePlayers(numberOfPlayers);
					this.enableTournamentHashGuard();
					});

				const goBackButton = document.getElementById('tournament-back-button') as HTMLButtonElement | null;	

				if (goBackButton) {
					goBackButton.addEventListener('click', (e) => {
						e.preventDefault();
						this.showOnly('select-tournament');
					});
				}

				// function handleEvent(event: MouseEvent | KeyboardEvent) {
				//   event.preventDefault();

				//   if (event instanceof MouseEvent) {
				// 	const target = event.target as HTMLElement;
				// 	console.log(`Click detected on: ${target.tagName}`);
				// 	console.log(`Event target:`, target);	  
				// 	const targetElement = event.target as HTMLElement;
				// 	if (targetElement.tagName === 'A') {
				// 		const href = (targetElement as HTMLAnchorElement).href;
				// 		alert(`Click detectado en: ${targetElement.tagName}\nHref: ${href}`);
				// 	} else {
				// 		alert(`Click detectado en: ${targetElement.tagName}`);
				// 	}

				//   } else if (event instanceof KeyboardEvent) {
				//     alert(`Tecla presionada: ${event.key}`);
				//   }
				// }

				
			}
		});

		document.getElementById('remoteTournament')?.addEventListener('click', async () => {
			showMessage("Remote tournament comming soon...", 5000);
			// await this.game.setPlayerInfo('player1', null);
			// this.game.setGuestInfo('player2', 'ai');
			// this.game.setGameMode('1vAI');
			// this.showOnly('tournament-config-panel');
		});
	
		document.getElementById('searchTournament')?.addEventListener('click', async () => {
			showMessage("Search tournament comming soon...", 5000);
			// Lobby + diff player entry assignation
			// await this.game.setPlayerInfo('player1', null);
			// this.game.setGameMode('remote');
			// this.showOnly('tournament-config-panel');
		});
	}

	async preparePlayers(numberOfPlayers: number): Promise<void> {
		// this.tournament.setEmptyTournamentPlayers(numberOfPlayers);
		if (this.tournament.getTournamentPlayers().length < 1) {
			await this.getFirstPlayer();
						console.log("Pending players desde preparePlayers:", this.tournament.getPendingPlayersCount());
			console.log("Preparing players for tournament with number of players:", numberOfPlayers);
			this.getNextPlayer();
		}else {
			console.log("Tournament players already prepared, skipping getFirstPlayer.");
			this.getNextPlayer();
		}

	}

	getNextPlayer(): void {
		console.log("Getting next player for tournament");
		const trutru = this.tournament.getTournamentPlayers();
		console.log("Tournament players:", trutru);
		const numberOfPlayers = this.tournament.getTournamentConfig().numberOfPlayers;
		const numberOfPendingPlayers = this.tournament.getPendingPlayersCount();
		if (numberOfPendingPlayers === 0) {
			this.tournament.launchTournament(this.tournament); // No pending players to prepare
		}	
		const players = this.tournament.getTournamentPlayers();
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
							id: `${tournamentPlayer.Index}+_Guest00${tournamentPlayer.Index}`,
							username: `Guest00${i}`,
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
						if (guestData) {
							tournamentPlayer.gameplayer = guestData.gameplayer;
							tournamentPlayer.gameplayer.id = `${tournamentPlayer.Index}+_Guest00${tournamentPlayer.Index}`,
							tournamentPlayer.gameplayer.username =`Guest00${i}`,
							tournamentPlayer.status = 'ready';
						} else {
							showMessage("Tournament name already exists", null);
							guestTournamentName.value = '';
							return; // Exit if the guest is not valid
						}
					}
				} else if (selectedOption === 3) {// AI 
					tournamentPlayer.gameplayer = {
						id: `${tournamentPlayer.Index}+_Ai00${tournamentPlayer.Index}`,
						username: `Ai00${tournamentPlayer.Index}`,
						tournamentUsername: `Ai00${tournamentPlayer.Index}`,
						email: `ai${tournamentPlayer.Index}@transcendence.com`,
						avatarPath: `https://localhost:8443/back/images/avatar_ai_${i-1}.png`
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
		console.log("going out next player for tournament");
		const tritri = this.tournament.getTournamentPlayers();
		console.log("Tournament players:", tritri);
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

		let nextMatchIndex =  this.tournament.getNextGameIndex();
		const gameDataArray = this.tournament.getGameDataArray();

		if (gameDataArray[nextMatchIndex].id.includes('Bye')) {
			this.tournament.launchNextMatch()
			return;
		}
		this.loadTemplate('../../html/tournament/nextMatch.html').then(nextMatchHtml => {
			let parsed = nextMatchHtml;
			console.log("En renderNextMatchInfo data array:", gameDataArray);
			console.log("renderNextMatchInfo: Next game index:", nextMatchIndex);
			const player1 = gameDataArray[nextMatchIndex].player1;
			const player2 = gameDataArray[nextMatchIndex].player2;
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
								new RegExp(`(<img[^>]*id=["']winner_match_${matchIndex}_img(\\.\\d+)?["'][^>]*src=["'])[^"']*(['"][^>]*>)`, 'g'),
								`$1${data[i].avatarPath}$3`
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
		console.log("en getFirstPlayrer tournament:Gameplayers: " + JSON.stringify(this.tournament.getTournamentPlayers()));
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
				console.log("Tournament ID set to:", this.tournament.getTournamentId());
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

	/**
	 * 	resets the tournament configuration sliders to their default values.
	 *  keeping the html structure intact.
	 */
	resetConfigSliders(): void {
    const numberSlider = document.getElementById("tournament-number-of-players") as HTMLInputElement | null;
    const numberValue = document.getElementById("tournament-number-of-players-value") as HTMLElement | null;
    if (numberSlider) {
        numberSlider.value = "4"; // Valor por defecto
        if (numberValue) numberValue.textContent = "4";
    }

    const scoreSlider = document.getElementById("tournament-score-limit") as HTMLInputElement | null;
    const scoreValue = document.getElementById("tournament-score-value") as HTMLElement | null;
    if (scoreSlider) {
        scoreSlider.value = "5"; // Valor por defecto
        if (scoreValue) scoreValue.textContent = "5";
    }

    const difficultySlider = document.getElementById("tournament-difficulty") as HTMLInputElement | null;
    const difficultyValue = document.getElementById("tournament-difficulty-value") as HTMLElement | null;
    const difficultyLabels = ["Easy", "Medium", "Hard"];
    if (difficultySlider) {
        difficultySlider.value = "2"; // Valor por defecto (Medium)
        if (difficultyValue) difficultyValue.textContent = difficultyLabels[1];
    }
	}
	/**
	 * Resets the tournament HTML containers to their initial state.
	 * This method clears the content of the tournament bracket, next match, and results containers.
	 * that get fullfill with every update of the tournament
	 */
	resetTournamentHTML(): void {
	    const containers = [
	        'tournament-bracket-container',
	        'next-match-bracket',
	        'tournament-results'
	    ];
	    containers.forEach(id => {
	        const el = document.getElementById(id);
	        if (el) el.innerHTML = '';
	    });
	}

	/**
	 * Resets the tournament state, including the tournament configuration and player containers.
	 * This method clears the registered players and select player containers, 
	 * resets the tournament, delete the temporary players,and disables the tournament hash guard.
	 */
	resetTournament(): void {
		this.showOnly('select-tournament');
		this.tournament.resetTournament();
		// this.tournament = new Tournament();
		this.disableTournamentHashGuard();

		// Limpia los contenedores de jugadores
		const registeredPlayers = document.getElementById('registered-players');
		if (registeredPlayers) registeredPlayers.innerHTML = '';
		const selectPlayerContainer = document.getElementById('select-player-container');
		if (selectPlayerContainer) selectPlayerContainer.innerHTML = '';
		this.resetConfigSliders();
		this.resetTournamentHTML();
	}

//////////////////////////////////////////////////////////


	private handleAnchorClick(anchor: HTMLAnchorElement) {
		const href = anchor.getAttribute('href') || '';
		if (href.startsWith('#')) {
			// Previene el comportamiento predeterminado
			// (esto se hace fuera del handler original ya)
			if (href.includes('#tournament-lobby')) {
				const confirmChange = confirm("you are leaving the tournament lobby. Do you want to continue?");
				if (confirmChange) {
					this.resetTournament();
					this.tournament.LeaveWithoutWarningFLAG = true; // avoid duplicate confirmation
					window.location.hash = href;
					this.disableTournamentHashGuard(); // disables the hash guard
				}
			} else {
				const confirmOther = confirm("Are you sure you want to leave the tournament?");
				if (confirmOther) {
					this.tournament.LeaveWithoutWarningFLAG = true; // avoid duplicate confirmation
					this.resetTournament();
					window.location.hash = href;
					this.disableTournamentHashGuard(); // si quieres desactivar protección desde H1
				//todo: INCLUIR AQUÍ ELIMINADO LOS TEMP USERS
				}
			}
		}
	}

	evaluarMovimiento(event: MouseEvent | KeyboardEvent) {
		const isClick = event instanceof MouseEvent;
		const isKey = event instanceof KeyboardEvent;

		if (isClick) {
			const target = (event as MouseEvent).target as HTMLElement;
			console.log(`Click detected on: ${target.tagName}`);

			// guard for the title H1 "TRANSCENDENCE" inside an A element
			if (target.tagName === 'H1') {
				const closestAnchor = target.closest('a') as HTMLAnchorElement | null;
				if (closestAnchor) {
					console.log("Click on H1 inside A; rerouting to A element.");
					event.preventDefault();
					this.handleAnchorClick(closestAnchor);
					return;
				}
			}

			if (target.tagName === 'A') {
				this.handleAnchorClick(target as HTMLAnchorElement);
				event.preventDefault(); // solo si realmente fue necesario
			}
		} else if (isKey) {
			const keyboardEvent = event as KeyboardEvent;
			// Prevent Alt+F4 and Ctrl+F5 to avoid accidental exit/reload

			if (keyboardEvent.ctrlKey && keyboardEvent.key === "F5") {
				alert("This key combination is disabled during the tournament.");
				keyboardEvent.preventDefault();
				return;
			}


			if (keyboardEvent.key === "F5") {
				keyboardEvent.preventDefault();
				const confirmExit = confirm("Are you sure you want to reload and reset the tournament?");
				if (confirmExit && keyboardEvent.key === "F5") {
					this.resetTournament(); // Reset the tournament state
					location.reload();
				}
			}
			if (keyboardEvent.key === "Escape") {
				keyboardEvent.preventDefault();
				const confirmExit = confirm("this will lead yo to Home. Are you sure you want to exit the tournament?");
				if (confirmExit && keyboardEvent.key === "Escape") {
					// lógica personalizada, si deseas redirigir
					console.log("Escape pressed, user confirmed exit.");
					this.resetTournament(); // Reset the tournament state
					window.location.href = "#home";
				}
			}
		}
	}

	private boundClickHandler: ((event: MouseEvent) => void) | null = null;
	private boundKeyHandler: ((event: KeyboardEvent) => void) | null = null;

	enableTournamentHashGuard() {
		window.addEventListener("pagehide", () => {
			const tournamentId = this.tournament.getTournamentId();
			if (tournamentId !== null && tournamentId !== undefined) {
				fetch('https://localhost:8443/back/delete_user_by_tournament_id', {
					method: 'DELETE',
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ TournamentId: tournamentId.toString() }),
					keepalive: true
				});
			}
		});

		if (!this.boundClickHandler) {
			this.boundClickHandler = this.evaluarMovimiento.bind(this);
			document.addEventListener('click', this.boundClickHandler, true); // `true` para capturar antes del default
		}

		if (!this.boundKeyHandler) {
			this.boundKeyHandler = this.evaluarMovimiento.bind(this);
			document.addEventListener('keydown', this.boundKeyHandler, true);
		}

	}

	disableTournamentHashGuard() {
		if (this.boundClickHandler) {
			document.removeEventListener('click', this.boundClickHandler, true);
			this.boundClickHandler = null;
		}
		if (this.boundKeyHandler) {
			document.removeEventListener('keydown', this.boundKeyHandler, true);
			this.boundKeyHandler = null;
		}
	}
}






















//////////////////////////////////////////////////////////////


	// private boundOnLeavingTournamentLobby: (event: HashChangeEvent) => void;

	// onLeavingTournamentLobby(event: HashChangeEvent) {
	// 	const fromHash = new URL(event.oldURL).hash;
	// 	const toHash = new URL(event.newURL).hash;
	// 	console.log("onLeavingTournamentLobby called");
	// 	// Solo si salimos de #tournament-lobby
	// 	if (fromHash === "#tournament-lobby") {
	// 		const confirmChange = confirm("Estás saliendo del lobby del torneo. ¿Quieres continuar?");
	// 		if (!confirmChange) {
	// 			// Revertir al lobby
	// 			location.hash = fromHash;
	// 		}
	// 		else {
	// 			// Si el torneo tiene un ID válido, eliminar los usuarios temporales
	// 			console.log("En else Confirm change to:", toHash);
	// 			if (this.tournament){
	// 				console.log("En if antes de getTournamentId");
	// 				let Tid = this.tournament.getTournamentId()?? -42;
	// 				console.log("Deleting temp users for tournamentId:", Tid);
	// 				try {
	// 					this.tournament.deleteTempUsers(Tid);
	// 				} catch (error) {
	// 					console.error("Error deleting temp users by tournamentId:", error);
	// 				}
	// 			}
	// 			this.disableTournamentHashGuard();
	// 		}
	// 	}

	// }


	// evaluarMovimiento(event: MouseEvent) {
	// 	const target = event.target as HTMLElement;
	// 	console.log(`Click detected on: ${target.tagName}`);

	// 	if (target.tagName === 'H1') 
	// 		this.disableTournamentHashGuard();
	// 	if (target.tagName === 'A' && (target as HTMLAnchorElement).href.includes('#tournament-lobby')) {
	// 		const confirmChange = confirm("You are leaving the tournament lobby. Do you want to continue?");
	// 		if (!confirmChange) {
	// 			return// Revertir el cambio de Hash
	// 		}
	// 	}
	// }

	// // Activar protección
	// private boundClickHandler: ((event: MouseEvent) => void) | null = null;
	// private boundKeyHandler: ((event: KeyboardEvent) => void) | null = null;


	// enableTournamentHashGuard() {
	// 	// Guarda el handler para poder eliminarlo después
	// 	this.boundClickHandler = (event: MouseEvent) => {
	// 		event.preventDefault();
	// 		this.evaluarMovimiento(event);
	// 	};
	// 	this.boundKeyHandler = (event: KeyboardEvent) => {
	// 		// Add your key handling logic here if needed
	// 		// For now, just prevent default as a placeholder
	// 		event.preventDefault();
	// 	};
	// }

	// disableTournamentHashGuard() {
	// 	if (this.boundClickHandler) {
	// 		document.removeEventListener('click', this.boundClickHandler);
	// 		this.boundClickHandler = null;
	// 	}
	// 	if (this.boundKeyHandler) {
	// 		document.removeEventListener('keydown', this.boundKeyHandler);
	// 		this.boundKeyHandler = null;
	// 	}
	// }





		// window.onhashchange = function (event) {
		// 	const confirmChange = confirm("Estás seguro de que quieres cambiar de sección?");
		// 	if (!confirmChange) {
		// 		// Revertir el cambio de hash
		// 		history.pushState(null, '', event.oldURL);
		// 	} else {
		// 		// Proseguir con el cambio
		// 		console.log("Hash actual:", location.hash);
		// 	}
		// };
		// Asumiendo que ya agregaste algo al historial con pushState

				// Captura clicks en toda la página
				// document.addEventListener('click', (event: MouseEvent) => {
				//   const target = event.target as HTMLElement;

				//   // Subimos hasta el <a> más cercano si existe
				//   const anchor = target.closest('a');

				//   if (anchor && anchor instanceof HTMLAnchorElement && anchor.href.includes('#')) {
				//     handleEvent(event);
				//   }
				//   else if (target.tagName === 'A' && (target as HTMLAnchorElement).href.includes('#')) {
				//     handleEvent(event);
				//   }
				// });

				// // Captura cualquier tecla presionada
				// document.addEventListener('keydown', (event: KeyboardEvent) => {
				//   handleEvent(event);
				// });
