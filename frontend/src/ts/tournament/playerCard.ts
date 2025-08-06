import { TournamentPlayer } from "./types";
import { showMessage } from '../modal/showMessage.js';


export class PlayerCard {
	private player_index: number;
	private templatePath: string;
	protected el?: HTMLElement;
	protected tournamentId?: string;
	public tournamentPlayer: TournamentPlayer;
    public onPlayerFilled?: (tournamentPlayer: TournamentPlayer, selectedOption:number) => void;

	constructor(playerIndex: number, container:HTMLElement, tournamentId?: string) {
		console.log("Creating PlayerCard component");
		console.log("Player index:", playerIndex);
	  	console.log("Container element:", container);	
		this.player_index = playerIndex;
	  	this.templatePath = "../html/tournament/PlayerForm.html";
		this.tournamentId = tournamentId;
		this.el = container;
		this.render(this.el);
		this.tournamentPlayer = {
			Index: playerIndex.toString(),
			status: 'pending', // Initial status
			gameplayer: { id: 0, username: '', tournamentUsername:'',email:'',avatarPath:'' } // Assuming GamePlayer has these properties
		};
	}
  
	async render(target: HTMLElement, placeholders: Record<string, string> = {}) {
	  	const html = await this.loadTemplate();
		const parsed = html.replace(/\{\{\s*userIndex\s*\}\}/g, this.player_index.toString());
	  	const wrapper = document.createElement('div');
	   	wrapper.innerHTML = parsed;
  	  	this.el = wrapper.firstElementChild as HTMLElement;
	  	target.appendChild(this.el);
  		this.setupEventListeners();
	}

	setupEventListeners(){
		const playersLoginForm = document.getElementById(`players-login-form-${this.player_index}`) as HTMLFormElement;
		const playerEmail = document.getElementById(`players-email-${this.player_index}`) as HTMLInputElement;
		const playerPassword = document.getElementById(`players-password-${this.player_index}`) as HTMLInputElement;
		const playersLogintBtn = document.getElementById(`players-login-btn-${this.player_index}`) as HTMLButtonElement;
		const AiplayerBtn = document.getElementById(`players-ai-btn-${this.player_index}`) as HTMLButtonElement;
		const guestTournamentName = document.getElementById(`guest-tournament-name-${this.player_index}`) as HTMLInputElement;
		const guestLoginForm = document.getElementById(`guests-login-form-${this.player_index}`) as HTMLFormElement;
		const ErrorContainer = document.getElementById(`players-login-error-${this.player_index}`) as HTMLDivElement;
		const PlayAsGuestBtn = document.getElementById(`players-guest-btn-${this.player_index}`) as HTMLButtonElement;
		
			if (guestLoginForm) {
				guestLoginForm.addEventListener('submit', (event) => {
					event.preventDefault();
					console.log(`Guest Player ${this.player_index} login form submitted`);
					console.log(`Guest Tournament Name: ${guestTournamentName?.value}`);
					// Handle guest login logic here
					if (this.onPlayerFilled) {
						this.onPlayerFilled(this.tournamentPlayer, 2);
					}		
					});
				}
		
		
			if (playersLogintBtn) {
				playersLogintBtn.addEventListener('click', (event) => {
					event.preventDefault();
					console.log(`Player ${this.player_index} login button clicked`);
					if (playerEmail.value !== "" && playerPassword.value !== "") {
						this.tournamentPlayer.gameplayer.email = playerEmail.value;
						if (this.onPlayerFilled) {
							this.onPlayerFilled(this.tournamentPlayer, 1);
							}		
					}else {
						showMessage("Please fill in both email and password fields or choose a different mode", null);
						}
					});
				}

			if (AiplayerBtn) {
				AiplayerBtn.addEventListener('click', (event) => 
				{
					event.preventDefault();
					console.log(`AI Player ${this.player_index} button clicked`);
					if (this.onPlayerFilled) 
					{
						this.onPlayerFilled(this.tournamentPlayer, 3);
					}	
				});
			}
		
	}

	// Sets up event listeners for game mode buttons, which after will also set controllers
	// setupEventListeners(){
	// 	const playersLoginForm = document.getElementById(`players-login-form-${this.player_index}`) as HTMLFormElement;
	// 	const playerEmail = document.getElementById(`players-email-${this.player_index}`) as HTMLInputElement;
	// 	const playerPassword = document.getElementById(`players-password-${this.player_index}`) as HTMLInputElement;
	// 	const playersLogintBtn = document.getElementById(`players-login-btn-${this.player_index}`) as HTMLButtonElement;
	// 	const AiplayerBtn = document.getElementById(`players-ai-btn-${this.player_index}`) as HTMLButtonElement;
	// 	const guestTournamentName = document.getElementById(`guest-tournament-name-${this.player_index}`) as HTMLInputElement;
	// 	const guestLoginForm = document.getElementById(`guests-login-form-${this.player_index}`) as HTMLFormElement;
	// 	const ErrorContainer = document.getElementById(`players-login-error-${this.player_index}`) as HTMLDivElement;
	// 	const PlayAsGuestBtn = document.getElementById(`players-guest-btn-${this.player_index}`) as HTMLButtonElement;
		
	// 	if (guestLoginForm) {
	// 		guestLoginForm.addEventListener('submit', (event) => {
	// 			event.preventDefault();
	// 			console.log(`Guest Player ${this.player_index} login form submitted`);
	// 			console.log(`Guest Tournament Name: ${guestTournamentName?.value}`);
	// 			// Handle guest login logic here
	// 			this.checkGuestPlayer(guestTournamentName?.value).then((result) => {
	// 				if (result) {
	// 					console.log("En checkGuestPlayer, user2P: ", this.tournamentPlayer);
	// 					if (this.onPlayerFilled) {
	// 						this.onPlayerFilled(this.tournamentPlayer);
	// 					}		
	// 				}else {
	// 					console.error("Error: Guest player verification failed.");
	// 				}
	// 			});
	// 		});
	// 	}
	
	// 	if (playersLogintBtn) {
	// 		playersLogintBtn.addEventListener('click', (event) => {
	// 			event.preventDefault();
	// 			console.log(`Player ${this.player_index} login button clicked`);
	// 			if (playerEmail.value !== "" && playerPassword.value !== "") {
	// 				this.checkPlayer(playerEmail.value, playerPassword.value).then ((result) => {;
	// 				if (result) {
	// 					console.log("En checkPlayer2P, user2P: ", this.tournamentPlayer);
	// 					if (this.onPlayerFilled) {
	// 						this.onPlayerFilled(this.tournamentPlayer);
	// 					}		
	// 				}else {
	// 					console.error("Error: Player verification failed.");
	// 				}
	// 				}).catch((error) => {
	// 					console.error("Error en la verificación:", error);
	// 				});				
	// 			}
	// 			console.log("fin de checkPlayer");
	// 		});
	// 	}

	// 	if (AiplayerBtn) {
	// 		AiplayerBtn.addEventListener('click', (event) => {
	// 			event.preventDefault();
	// 			console.log(`AI Player ${this.player_index} button clicked`);
	// 		});
	// 	}
	// }

	// async checkGuestPlayer(guestTorunamentName: string) {
	// 	console.log(`Guest Player en checkguestPlayer: ${this.player_index} name: ${guestTorunamentName}`);
	// 	if (!guestTorunamentName || guestTorunamentName.trim() === '') {
	// 		const AvatarPath = `https://localhost:8443/back/images/avatar-${this.player_index}.png`; // Default avatar path
	// 		this.tournamentPlayer = {
	// 				Index: '',
	// 				status: 'ready', // Update status to ready
	// 				gameplayer: {
	// 					id: '',
	// 					username: '',
	// 					tournamentUsername: '',
	// 					email: '',
	// 					avatarPath: AvatarPath // Default avatar path
	// 				}
	// 			};
	// 	}
	// 	else {
	// 		const guestData =  { tournamentId:this.tournamentId, tournamentName: guestTorunamentName}
	// 		try {
	// 			const response = await fetch("https://localhost:8443/back/verify_guest_tournamentName", {
	// 				method: "POST",
	// 				headers: {
	// 					"Content-Type": "application/json",
	// 				},
	// 				body: JSON.stringify(guestData),
	// 			});
	// 			if (!response.ok) {
	// 				const result = await response.json();
	// 				showMessage(`Error: ${result.error}`, null);
	// 				return false;
	// 			} else {
	// 				const result = await response.json();
	// 				const user2P = result;
	// 				this.tournamentPlayer = {
	// 						Index: '',
	// 						status: 'ready', // Update status to ready
	// 						gameplayer: {
	// 							id: '',
	// 							username: '',
	// 							tournamentUsername: guestTorunamentName,
	// 							email: '',
	// 							avatarPath: result.avatarPath // Default avatar path
	// 						}
	// 					};
	// 				}
	// 		} catch (error) {
	// 			console.error("Error while verifying:", error);
	// 			}
			
	// 			if (this.onPlayerFilled) {
	// 			this.onPlayerFilled(this.tournamentPlayer);
	// 			}
	// 	}
	// }

	// async checkPlayer (email: string |null, password: string|null) {
	// 	const data = {
	// 		email: email,
	// 		password: password
	// 	}
	// 	try {
	// 		const response = await fetch("https://localhost:8443/back/verify_tounament_user", {
	// 			method: "POST",
	// 			headers: {
	// 				"Content-Type": "application/json",
	// 			},
	// 			body: JSON.stringify(data),
	// 		});
	// 		if (!response.ok) {
	// 			const result = await response.json();
	// 			showMessage(`Error: ${result.message}`, null);
	// 			return false;
	// 		} else {
	// 			const result = await response.json();
	// 			const user2P = result;
	// 			this.tournamentPlayer = {
	// 				Index: this.player_index.toString(),
	// 				status: 'ready', // Update status to ready
	// 				gameplayer: {
	// 					id: user2P.id,
	// 					username: user2P.username,
	// 					tournamentUsername: user2P.tournamentUsername,
	// 					email: user2P.email,
	// 					avatarPath: user2P.avatarPath
	// 				}
	// 			};
	// 			return user2P;
	// 		}
	// 	} catch (error) {
	// 		console.error("Error while verifying:", error);
	// 	}
	// }

	private async loadTemplate(): Promise<string> {
	  const response = await fetch(this.templatePath);
	  return await response.text();
	}
  
	// private replacePlaceholders(template: string, data: Record<string, string>): string {
	//   return template.replace(/\{\{(.*?)\}\}/g, (_, key) => {
	// 	const trimmedKey = key.trim();
	// 	if (!(trimmedKey in data)) {
	// 	  console.warn(`Missing placeholder key: ${trimmedKey}`);
	// 	}
	// 	return data[trimmedKey] || '';
	//   });
	// }


						



  }