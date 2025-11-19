/**
 * Game.ts -> main class file with core functionalities and get/setters
 */

import { GameConnection } from './GameConnection.js';
import { GameRender } from './GameRender.js';
import { GameUI } from './GameUI.js';
import { Step } from '../spa/stepRender.js';
import { GameData, GameConfig, GamePlayer} from './types.js';
import GameMatch from './GameMatch.js';
import { fetchRandomAvatarPath } from './utils.js'

// Default container ID (I think i should match HTML file)
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
	protected	match: GameMatch | null = null;
	protected	isHost: boolean;
	protected	gameId: string;
	protected	onlineId: string | null = null;
	public		pauseDuration: number;

	/***************************************/
	/*********** CONSTRUCTOR ***************/
	constructor(containerId: string = DEFAULT_CONTAINER_ID, id?: string)
	{
		super(containerId);
		if (id)
			this.gameId = id;
		else
			this.gameId = "game-" + Date.now().toString(36);
		this.connection = new GameConnection(this);
		this.renderer = new GameRender(this);
		this.ui = new GameUI(this);
		this.log = {
			id: this.gameId,
			mode: '',
			playerDetails: {player1: null, player2: null},
			startTime: 0,
			config: {scoreLimit: 5, difficulty: 'medium'},
			result: {winner: '', loser: '', score: [0,0], endReason: ''},
			duration: 0,
			tournamentId: null,
			readyState: false
		};
		this.isHost = true;
		this.pauseDuration = 60000 * 0.5;
		console.log("Game instance created with container ID:", containerId);
		console.log("Game log initialized:", this.log);
	}

	/************ CORE *****************/
	/*********** METHODS ***************/
	async render(appElement: HTMLElement): Promise<void>
	{
		await this.ui.initializeUI(appElement);
		await this.connection.establishConnection();
	}

	public startGameSession(): void
	{
		this.log.startTime = Date.now();
		console.log(`Starting game session. Mode: ${this.log.mode}`);
		this.log.readyState = true;
	}

	public endGameSession(result: { winner: string, loser: string, score: [number, number], endReason: string }): void
	{
		this.log.duration = Date.now() - this.log.startTime;
		this.log.result = result;
		console.log("Game session ended:", this.log);
		this.renderer.stopRenderLoop();
		this.log.readyState = false;
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
		if (log.id !== undefined)
			this.log.id = log.id;
		if (log.mode !== undefined)
			this.log.mode = log.mode;
		if (log.playerDetails !== undefined)
			this.log.playerDetails = log.playerDetails;
		if (log.startTime !== undefined)
			this.log.startTime = log.startTime;
		if (log.config !== undefined)
			this.log.config = log.config;
		if (log.result !== undefined)
			this.log.result = log.result;
		if (log.duration !== undefined)
			this.log.duration = log.duration;
		if (log.tournamentId !== undefined)
			this.log.tournamentId = log.tournamentId;
		if (log.readyState !== undefined)
			this.log.readyState = log.readyState;
	}
	
	public setGameMode(mode: string): void
	{
		this.log.mode = mode;
	}

	public setGameConfig(config: GameConfig): void
	{
		if (config.scoreLimit)
			this.gameConfig.scoreLimit = config.scoreLimit;
		if (config.difficulty)
			this.gameConfig.difficulty = config.difficulty;
		if (this.log)
			this.log.config = { ...this.gameConfig };
	}

	public async setPlayerInfo(playerKey: 'player1' | 'player2', data: {email: string, password: string} | null = null): Promise<void>
	{
		const user = await this.connection.parseUserInfo(data) as GamePlayer;
		this.log.playerDetails[playerKey] = user;
	}

	public async setGuestInfo(playerKey: 'player1' | 'player2', name: 'ai'| 'guest'): Promise<void>
	{
		const	wildcardID : number = name === 'guest' ? -2 : -1;
		const	avatarPath : string = await fetchRandomAvatarPath();
		
		const	tempUser : GamePlayer = {
			id: wildcardID,
			username: `${name}-${Date.now().toString(36)}`,
			tournamentUsername: 'name',
			email: `${name}-${Date.now().toString(36)}@email.com`,
			avatarPath: avatarPath
		};
		this.log.playerDetails[playerKey] = tempUser;
	}

	public setTournamentId(id: number): void
	{
		this.log.tournamentId = id;
	}

	public setGameMatch(match: GameMatch): void
	{
		this.match = match;
	}

	public	setGameIsHost(state: boolean) : void
	{
		this.isHost = state;
	}

	public setOnlineId(id: string ): void
	{
		this.onlineId = id;
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

	public getGameMatch(): GameMatch | null
	{
		return (this.match);
	}

	public	getGameIsHost() : boolean
	{
		return (this.isHost);
	}

	public	isGameActive() : boolean
	{
		return (this.log.readyState);
	}

	public	getOnlineId() : string | null
	{
		return (this.onlineId);
	}
}
