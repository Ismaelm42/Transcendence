import { Step } from '../spa/stepRender.js';
import { TournamentUI } from '../tournament/TournamentUI.js';
import { TournamentData, TournamentConfig, TournamentPlayer} from './types.js';
import { GameData, GamePlayer } from '../game/types.js';
// import { game } from '../game/Game.js';

// Default container ID (I think i should match HTML file)
const DEFAULT_CONTAINER_ID = "tournament-container";

export default class Tournament extends Step {
	
	protected tournamentId: number | null = null;
	protected tournamentPlayers: TournamentPlayer[] = [];
	// protected games: game[] | null = null;
	protected ui: TournamentUI;
	protected tournamentConfig: TournamentConfig = {numberOfPlayers:4, scoreLimit: 5, difficulty: 'medium'};
	protected bracket: GamePlayer[] = [];
	protected gameDataArray: GameData[] = [];
	protected tournamentPendingPlayers: number = this.tournamentConfig.numberOfPlayers;

	/*********** CONSTRUCTOR ***************/
	constructor(containerId: string = DEFAULT_CONTAINER_ID)
	{
		super(containerId);
		this.findNextTournamentId().then(id => {
			this.tournamentId = id;
		});
		this.ui = new TournamentUI(this);
		// todo: inicializarlo para usarlo como Gamedata
		// this.log = {
		// 	id: "tournament " + Date.now(),
		// 	mode: '',
		// 	player1: null,
		// 	player2: null,
		// 	startTime: 0,
		// 	config: undefined,
		// 	result: {winner: '', loser: '', score: [0,0]},
		// 	duration: 0,
		// 	tournamentId: null,
		// 	readyState: false
		// };
	}
	
	public setTournamentId(tournamentId: number): void {
		this.tournamentId = tournamentId;
	}
	public getTournamentId(): number | null {
		return this.tournamentId;
	}	
	async findNextTournamentId(): Promise<number> {
		return 42; // insert the functionto retrieve next tournament ID available
	}

	async render(appElement: HTMLElement): Promise<void>  {
		await this.ui.initializeUI(appElement);

		// const menuContainer = document.getElementById("menu-container");
		// try {
		// 	console.log("En Play Tournament Step render");
		// 	const user = await this.checkAuth();
		// 	if (user) {		
		// 		// Retornar el contenido para usuarios autenticados
		// 		appElement.innerHTML = `
		// 				<div class="flex-grow flex flex-col items-center justify-center ">
		//    					<h1 class="text-4xl font-bold text-gray-800">Play Tournament Step</h1>
		// 				</div>
		// 		`;
		// 		} else {
		// 			// Retornar el contenido para usuarios no autenticados
		// 			appElement.innerHTML =  `
		// 				<div id="pong-container">
		// 					<div class="paddle left-paddle"></div>
		// 					<div class="ball"><img src="../img/bola.png" alt="Ball"></div>
		// 					<div class="paddle right-paddle"></div>
		// 				</div>
		// 			`;
		// 	}
		// } 
		// catch (error) {
		// 	console.error("Error en render:", error);
		// 	appElement.innerHTML =  `<div id="pong-container">Ocurrió un error al generar el contenido</div>`;
		// }
	}
	public setTournamentConfig(config: TournamentConfig): void{
		this.tournamentConfig = config;
		// this.log.config = config;
	}

	public getTournamentConfig(): TournamentConfig{
		return this.tournamentConfig;
	}

	public setEmptyTournamentPlayers(numberOfPlayers: number): void{
		this.tournamentPlayers = [];
		for (let i = 0; i < numberOfPlayers; i++) {
			this.tournamentPlayers.push({
				Index: i.toString(),
				status: 'pending', // 
				gameplayer: { id: '', username: '', tournamentUsername:'',email:'',avatarPath:'' } // Assuming GamePlayer has these properties
			});
		}
	}

	public checkTournamentPlayers(): boolean
	{
		if (this.tournamentPlayers.length === 0) {
			console.warn("No players in the tournament.");
			return false;
		}
		for (const player of this.tournamentPlayers) {
			if (player.status === 'pending' ){
			return false;
			}
		}
		return true;
	}

	public getTournamentPlayers(): TournamentPlayer[]{
		return this.tournamentPlayers;
	}

	public getTournamentPlayerByIndex(index:number): TournamentPlayer[]| null		{
		const player = this.tournamentPlayers[index];
		return player && player.gameplayer && player.gameplayer.id ? [player] : null;
	}

	public setTournamentPlayer(index:number, status: 'pending' | 'ready' | 'waiting', player: GamePlayer): void	{
		this.tournamentPlayers[index].status = status;
		this.tournamentPlayers[index].gameplayer = player;
	}

	public addTournamentPlayer(player: TournamentPlayer): void{
		console.log("Adding player to tournament:", player);
		if (this.tournamentPlayers.length < this.tournamentConfig.numberOfPlayers) {
			console.log("Adding player to tournament: dentro del if");
			player.Index = this.tournamentPlayers.length.toString(); // Assign an ID based on the current length
			player.status = 'ready'; // Default status for new players
			this.tournamentPlayers.push(player);
			this.tournamentPendingPlayers--;
		} else {
			console.warn("Cannot add more players, tournament is full.");
		}
		console.log("Current tournament players: ", this.tournamentPlayers.length);
		console.log("Pending players count: ", this.tournamentPendingPlayers);
	}

	public getPendingPlayersCount(): number {
		return this.tournamentPendingPlayers;
	}

	public setPendingPlayersCount(count: number): void {
		this.tournamentPendingPlayers = count;
	}

	public getGameDataArray(): GameData[] {
		return this.gameDataArray;
	}
	
	public addGameData(gameData: GameData): void {
		if (!gameData || !gameData.id || !gameData.mode || !gameData.player1 || !gameData.player2) {
			console.error("Invalid game data provided:", gameData);
			return;
		}
		if (this.gameDataArray.length == this.tournamentConfig.numberOfPlayers) {
			console.warn("Game data array is already full. Cannot add more game data.");
			return;
		}
		this.gameDataArray.push(gameData);
		console.log("Game data added to tournament:", gameData);
		console.log("Current game data array length:", this.gameDataArray.length);
	}

	public returnMode(player1: GamePlayer, player2: GamePlayer): string {
		console.log("Returning mode for players:", player1, player2);
		if (player1.email.includes('ai') && player1.email.includes('@transcendence.com') 
				&& player2.email.includes('ai') && player2.email.includes('@transcendence.com') ) {
			return 'auto';
		} else if ((player1.email.includes('ai') && player1.email.includes('@transcendence.com')) 
				|| ( player2.email.includes('ai') && player2.email.includes('@transcendence.com'))) {
			return '1vAI';
		} else {
			return '1v1';
		}
	}

	private initialGameData(player1Index: number, player2Index: number){
		let newGameData: GameData = {
			id: this.tournamentId + "-match-"  + (this.gameDataArray.length + 1),
			mode: this.returnMode(this.bracket[player1Index], this.bracket[player2Index]),
			player1: this.bracket[player1Index],
			player2: this.bracket[player2Index],
			startTime: Date.now(),				
			config: {
				scoreLimit: this.tournamentConfig.scoreLimit,
				difficulty: this.tournamentConfig.difficulty
			},
			result: {
				winner: '',
				loser: '',
				score: [0, 0]
			},
			duration: 0,
			tournamentId: this.tournamentId,
			readyState: false
		};
		this.addGameData(newGameData);
	}
	
	public setTournamentBracket(bracket: TournamentPlayer[]): void {

		for (const player of bracket) {
			if (!player.gameplayer) {
				console.error("Invalid player data in bracket:", player);
				return;
			} else {
				this.bracket.push(player.gameplayer);
			}
		}
		console.log("Setting tournament bracket with players:", this.bracket);

		switch (this.bracket.length) {
			case 4:
				this.initialGameData(0, 1);
				this.initialGameData(2, 3);
				break;
			case 6:
				this.initialGameData(0, 1);
				this.initialGameData(2, 3);
				this.initialGameData(4, 5);
				break;
			case 8:
				this.initialGameData(0, 1);
				this.initialGameData(2, 3);
				this.initialGameData(4, 5);
				this.initialGameData(6, 7);
				break;
		}
	}

	public updateBracket(){
	}
	
}
