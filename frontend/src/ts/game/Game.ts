/**
 * Game.ts -> main class file with core functionality
 */

import { GameConnection } from './GameConnection.js';
import { GameRender } from './GameRender.js';
import { GameUI } from './GameUI.js';
import { Step } from "../stepRender.js";

// Default container ID (must match your HTML)
const DEFAULT_CONTAINER_ID = "game-container"; 

class Game extends Step
{
	protected connection: GameConnection;
	protected renderer: GameRender;
	protected ui: GameUI;

	constructor(containerId: string = DEFAULT_CONTAINER_ID)
	{
		super(containerId);
		this.connection = new GameConnection(this);
		this.renderer = new GameRender(this);
		this.ui = new GameUI(this);
	}

	async render(appElement: HTMLElement): Promise<void>
	{
		await this.ui.initializeUI(appElement);
		await this.connection.establishConnection();
		this.ui.setupEventListeners();
	}

	public destroy()
	{
		this.connection.destroy();
		this.renderer.destroy();
	}
}

const _default = new Game(); 
export default _default;