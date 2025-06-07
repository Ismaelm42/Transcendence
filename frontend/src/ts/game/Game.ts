/**
 * Game.ts -> main class file with core functionalities and get/setters
 */

import { GameConnection } from './GameConnection.js';
import { GameRender } from './GameRender.js';
import { GameUI } from './GameUI.js';
import { Step } from "../spa/stepRender.js";
import { GameData, GameConfig, GamePlayer} from './types.js';
import GameMatch from './GameMatch.js';

// Default container ID (must match your HTML)
const DEFAULT_CONTAINER_ID = "game-container";

export default class Game extends Step
{
	/********** COMPONENTS ****************/
	/*********** ATTRIBUTES ***************/
	protected	connection: GameConnection;
	protected	renderer: GameRender;
	protected	ui: GameUI;
	protected	log: GameData;
	protected	gameConfig: GameConfig = {scoreLimit: 5, difficulty: 'medium'};

	/***************************************/
	/*********** CONSTRUCTOR ***************/
	constructor(containerId: string = DEFAULT_CONTAINER_ID)
	{
		super(containerId);
		this.connection = new GameConnection(this);
		this.renderer = new GameRender(this);
		this.ui = new GameUI(this);
		this.log = {
			id: "game " + Date.now(),
			mode: '',
			player1: null,
			player2: null,
			startTime: 0,
			config: undefined,
			result: {winner: '', loser: '', score: [0,0]},
			duration: 0,
			tournamentId: null,
			readyState: false
		};
	}

	/************ CORE *****************/
	/*********** METHODS ***************/
	async render(appElement: HTMLElement): Promise<void>
	{
		await this.ui.initializeUI(appElement);
		await this.connection.establishConnection();
		this.ui.setupEventListeners();
	}

	public startGameSession(): void
	{
		this.log.startTime = Date.now();
		console.log(`Starting game session. Mode: ${this.log.mode}`);
	}

	public endGameSession(result: { winner: string, loser: string, score: [number, number] }): void
	{
		this.log.duration = Date.now() - this.log.startTime;
		this.log.result = result;
		console.log("Game session ended:", this.log);
		this.renderer.stopRenderLoop();
	}

	public destroy()
	{
		this.connection.destroy();
		this.renderer.destroy();
	}

	/***********************************/
	/*********** SETTERS ***************/
	public setGameLog(log: GameData): void
	{
		this.log = log;
	}
	
	public setGameMode(mode: string): void
	{
		this.log.mode = mode;
	}

	public setGameConfig(config: GameConfig): void
	{
		this.log.config = config;
	}

	public async setPlayerInfo(playerKey: 'player1' | 'player2', data: {email: string, password: string} | null = null): Promise<void>
	{
		const user = await this.connection.parseUserInfo(data) as GamePlayer;
		this.log[playerKey] = user;
	}

	public setGuestInfo(playerKey: 'player1' | 'player2', name: 'ai'| 'guest'): void
	{
		const tempUser : GamePlayer = {
			id: `${name}-${Date.now()}`,
			username: name,
			tournamentUsername: 'name',
			email: `${name}@email.com`,
			avatarPath: '/images/default-avatar.png'
		};
		this.log[playerKey] = tempUser;
	}

	public setTournamentId(id: number): void
	{
		this.log.tournamentId = id;
	}

	/***********************************/
	/*********** GETTERS ***************/
	public	getGameConfig(): GameConfig
	{
		return (this.gameConfig);
	}
	
	public getGameLog(): GameData
	{
		return (this.log);
	}

	public	getGameConnection(): GameConnection
	{
		return (this.connection);
	}

	public	getGameRender(): GameRender
	{
		return (this.renderer);
	}

	public	getGameUI(): GameUI
	{
		return (this.ui);
	}
}
