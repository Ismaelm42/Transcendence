/**
 * Game.ts -> main class file with core functionalities and get/setters
 */

import { GameConnection } from './GameConnection.js';
import { GameRender } from './GameRender.js';
import { GameUI } from './GameUI.js';
import { Step } from "../spa/stepRender.js";
import { GameData, GameConfig} from './types.js';

// Default container ID (must match your HTML)
const DEFAULT_CONTAINER_ID = "game-container"; 

export default class Game extends Step
{
	protected connection: GameConnection;
	protected renderer: GameRender;
	protected ui: GameUI;
	protected log: GameData;
	protected gameConfig: GameConfig = {scoreLimit: 5, difficulty: 'medium'};

	constructor(containerId: string = DEFAULT_CONTAINER_ID)
	{
		super(containerId);
		console.log("Game constructor called");
		this.connection = new GameConnection(this);
		this.renderer = new GameRender(this);
		this.ui = new GameUI(this);
		this.log = {
			mode: '',
			player1: null,
			player2: null,
			startTime: 0,
			config: undefined,
			result: {winner: '', loser: '', score: [0,0]},
			duration: 0,
			tournamentId: null
		};
	}

	async render(appElement: HTMLElement): Promise<void>
	{
		await this.ui.initializeUI(appElement);
		await this.connection.establishConnection();
		this.ui.setupEventListeners();
	}

	/**
	 * Set game mode (1vAI, 1v1, remote)
	 * @param mode Game mode
	 */
	public setGameMode(mode: string): void
	{
		this.log.mode = mode;
	}

	/**
	 * Set game configuration options
	 * @param config Game configuration object
	 */
	public setGameConfig(config: GameConfig): void
	{
		this.log.config = config;
		console.log(`Game configuration set: Score limit=${config.scoreLimit}, Difficulty=${config.difficulty}`);
	}

	/**
	 * Set player information
	 * @param playerKey 'player1' or 'player2'
	 * @param playerData Player data object
	 */
	public setPlayerInfo(playerKey: 'player1' | 'player2', playerData: any): void
	{
		this.log[playerKey] = playerData;
	}

	/**
	 * Set tournament ID if this game is part of a tournament
	 * @param id Tournament ID
	 */
	public setTournamentId(id: number): void
	{
		this.log.tournamentId = id;
	}

	/**
	 * Start tracking game session
	 */
	public startGameSession(): void
	{
		this.log.startTime = Date.now();
		console.log(`Starting game session. Mode: ${this.log.mode}`);
	}

	/**
	 * Handle game end - record final data
	 * @param result Result data from server
	 */
	public endGameSession(result: { winner: string, loser: string, score: [number, number] }): void
	{
		this.log.duration = Date.now() - this.log.startTime;
		this.log.result = result;
		console.log("Game session ended:", this.log);
		this.renderer.stopRenderLoop();
		this.ui.controllers.cleanup();
	}

	/**
	 * Get complete game log data
	 * @returns GameData object
	 */
	public getGameLog(): GameData
	{
		return (this.log);
	}

	public destroy()
	{
		this.connection.destroy();
		this.renderer.destroy();
	}
}
