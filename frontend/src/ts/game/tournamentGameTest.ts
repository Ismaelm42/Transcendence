// Some functions that could be useful if imported:
// import {checkPlayer, parsePlayerInfo} from '../game/GameConnection.js' - not sure if working fine without sockets
// import { setPlayerInfo, setGuestInfo } from '../game/Game.js'; - not usables, but could adapt to work outside the object instance
import Game from '../game/Game.js';
import { Step } from "../spa/stepRender.js";
import { GamePlayer, GameConfig, GameData } from '../game/types.js';

// Default container ID (I think it must match HTML file)
const DEFAULT_CONTAINER_ID = "tournament-container";

export class Tournament extends Step
{
	config: GameConfig | null; // This is set with the first div panel/form
	// First div panel will also set array size for players and bracket
	players: GamePlayer[] | null; // Each object of the array gets filled with assign-player form
	bracket: GameData[] | undefined; // Match making function will fill array with each match log-info
	currentMatchIndex: number = 0;

	constructor(containerId: string = DEFAULT_CONTAINER_ID)
	{
		super(DEFAULT_CONTAINER_ID);
		this.bracket = undefined;
		this.config = null;
		this.players = null;
	}

	async render(appElement: HTMLElement): Promise<void>
	{
		try
		{
			const response = await fetch("../../html/game/tournamentUI.html");
			if (!response.ok)
				throw new Error("Failed to load the game UI HTML file");
			const htmlContent = await response.text();
			appElement.innerHTML = htmlContent;
		}
		catch (error)
		{
			console.error("Error loading game UI:", error);
			appElement.innerHTML = `<div class="error-container">Failed to load game interface. Please try again.</div>`;
		}
		// setupListeners() method for forms, submit, buttons...
	}

	// Set main config, function trigger when config-panel fill and clicked on next
	tournamentMainConfig()
	{
		// Sets this.config
		// Sets players[] size
		// Sets bracket[] size
	}

	// Set player info, called once per player-card trigger button
	// Could import setPlayerInfo from GamePlaye
	assignPlayer()
	{

	}

	// Matchmaking first (or random) and then fill each game.log (metadata) of the array
	generateBracket()
	{

	}

	// Create new Game instance, set the needed params (i think log will be enough)
	//		and start the usual workflow client-server to start the match in its own step
	launchNextMatch()
	{
		// const matchData = this.bracket[this.currentMatchIndex];
		const game = new Game();
		// game.setGameLog(matchData);
		// Navigate to game-match step, passing game instance
	}

	// Receive and gather game results - may need to improve gameMatch class to pass this info
	handleMatchResult(result: GameData)
	{
		// Aux method -> Update bracket, increment currentMatchIndex, etc.
	}
}