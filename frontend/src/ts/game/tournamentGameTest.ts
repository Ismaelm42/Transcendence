// Some functions that could be useful if imported:
// import {checkPlayer, parsePlayerInfo} from '../game/GameConnection.js' - not sure if working fine without sockets
// import { setPlayerInfo, setGuestInfo } from '../game/Game.js'; - not usables, but could adapt to work outside the object instance
import Game from '../game/Game.js';
import { SPA } from '../spa/spa.js';
import { Step } from "../spa/stepRender.js";
import { GamePlayer, GameConfig, GameData } from '../game/types.js';
import { fetchRandomAvatarPath } from '../game/utils.js'

// Default container ID (I think it must match HTML file)
const DEFAULT_CONTAINER_ID = "tournament-container";

export default class Tournament extends Step
{
	public config: GameConfig | null; // This is set with the first div panel/form
	// First div panel will also set array size for players and bracket
	public	players: GamePlayer[] | null; // Each object of the array gets filled with assign-player form
	public	bracket: GameData[]; // Match making function will fill array with each match log-info
	private	game: Game;
	// TODO: currentMatchIndex needs to be stored on session and updated each time tournament step is rendered
	public	currentMatchIndex: number = 0;

	constructor(containerId: string = DEFAULT_CONTAINER_ID)
	{
		super(DEFAULT_CONTAINER_ID);
		this.game = new Game(DEFAULT_CONTAINER_ID, "tournament-game");
		this.bracket = [];
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
		// Generate test simple bracket with default values hardcoded
		this.generateTestBracket(4);
		// Create one Game instance for the whole tournament
		const spa = SPA.getInstance();
		spa.currentGame = this.game;
		await this.game.getGameConnection().establishConnection();
		
		const launchBtn = document.getElementById('launch-match-btn');
		if (launchBtn)
			launchBtn.addEventListener('click', () => this.launchNextMatch());
		this.displayCurrentMatch();
	}

	displayCurrentMatch()
	{
		const panel = document.getElementById('current-match-panel');
		if (!panel || !this.bracket)
			return;
		const match = this.bracket[this.currentMatchIndex];
		if (!match)
		{
			panel.innerHTML = "<p>No more matches.</p>";
			return;
		}
		panel.innerHTML = `
		<div class="bg-gray-800 border-2 border-[#00ff99] rounded-xl shadow-lg p-6 max-w-md mx-auto my-8 text-white">
			<h3 class="text-[#00ff99] text-xl font-bold mb-4 text-center tracking-wide">Current Match</h3>
			<div class="flex items-center justify-center gap-8 mb-4">
				<div class="flex flex-col items-center">
					<img src="${match.playerDetails.player1?.avatarPath || '/images/default-avatar.png'}" alt="Avatar" class="w-14 h-14 rounded-full border-2 border-[#00ff99] mb-2">
					<span class="font-semibold">${match.playerDetails.player1?.username}</span>
				</div>
				<span class="text-2xl font-bold text-[#00ff99]">VS</span>
				<div class="flex flex-col items-center">
					<img src="${match.playerDetails.player2?.avatarPath || '/images/default-avatar.png'}" alt="Avatar" class="w-14 h-14 rounded-full border-2 border-[#00ff99] mb-2">
					<span class="font-semibold">${match.playerDetails.player2?.username}</span>
				</div>
			</div>
			<div class="flex justify-between text-sm text-gray-300 mb-2">
				<span>Match ID:</span>
				<span class="font-medium text-white">${match.id}</span>
			</div>
			<div class="flex justify-between text-sm text-gray-300">
				<span>Score Limit:</span>
				<span class="font-medium text-white">${match.config?.scoreLimit}</span>
				<span class="ml-4">Difficulty:</span>
				<span class="font-medium text-white">${match.config?.difficulty}</span>
			</div>
		</div>
	`;
	}

	// Matchmaking first (or random) and then fill each game.log (metadata) of the array
	async generateTestBracket(count : number)
	{
		if (!this.bracket)
			this.bracket = [];
		for (let i = 0; i < count; i++)
		{
			const	avatarPlayer1 : string = await fetchRandomAvatarPath();
			const	avatarPlayer2 : string = await fetchRandomAvatarPath();
			const	matchData : GameData = {
				id: `test-match-${i + 1}`,
				mode: '1v1',
				playerDetails: {
					player1: {
						id: 40 + (i * 2 + 1),
						username: `Player${i * 2 + 1}`,
						tournamentUsername: `Player${i * 2 + 1}`,
						email: `player${i * 2 + 1}@test.com`,
						avatarPath: avatarPlayer1
					},
					player2: {
						id: 40 + (i * 2 + 2),
						username: `Player${i * 2 + 2}`,
						tournamentUsername: `Player${i * 2 + 2}`,
						email: `player${i * 2 + 2}@test.com`,
						avatarPath: avatarPlayer2
					}
				},
				startTime: Date.now(),
				config: {
					scoreLimit: 2,
					difficulty: 'medium'
				},
				result: {
					winner: '',
					loser: '',
					score: [0, 0]
				},
				duration: 0,
				tournamentId: 1,
				readyState: true
			};
			this.bracket.push(matchData);
		}
	}

	// "Recycle" game instance with current match data and launchGame, which will
	// start the game API workflow and go to match-render step
	launchNextMatch()
	{
		if (this.bracket && this.currentMatchIndex < this.bracket.length && this.game)
		{
			const	matchData : GameData = this.bracket[this.currentMatchIndex];
			this.game.setGameLog(matchData);
			if (matchData.config)
				this.game.setGameConfig(matchData.config);
			const	spa = SPA.getInstance();
			spa.currentGame = this.game;
			this.game.getGameUI().launchGame();
			this.currentMatchIndex++;
			this.displayCurrentMatch();
		}
	}

	// Receive and gather game results - may need to improve gameMatch class to pass this info
	// Also, may need to call it or implement it on a wait/promise manner?
	handleMatchResult(result: GameData)
	{
		// Aux method -> Update bracket, increment currentMatchIndex, etc.
	}
}