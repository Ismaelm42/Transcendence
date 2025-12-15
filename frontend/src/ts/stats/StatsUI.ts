/**
 * StatsUI.ts -> UI setup and event listeners
 */

import { getPongStats, getPongTournamentStats, getChessStats } from './getStats.js';
import Stats from './statsRender.js'

export class StatsUI
{
	private	stats: Stats;
	private activarEvents: boolean = true;
	constructor(stats: Stats)
	{
		this.stats = stats;
	}

	showOnly(divId: string, displayStyle: string = "block") : void
	{
		const divIndex = [
			'pong-stats-content',
			'pong-tournament-stats-content',
			'chess-stats-content'
		];
		if (divId === "hide_all")
		{
			divIndex.forEach(id => {
			const	checkDiv = document.getElementById(id);
			if (checkDiv)
				checkDiv.style.display = "none";
		});
			return ;
		}
		divIndex.forEach(id => {
			const	checkDiv = document.getElementById(id);
			if (checkDiv)
				checkDiv.style.display = (id === divId) ? displayStyle : "none";
		});
	}

	/************ Pendiente de implementación *****************/

	async initializeUI(appElement: HTMLElement): Promise<void>
	{
		try
		{
			const response = await fetch("../../html/stats/stats.html");
			if (!response.ok)
				throw new Error("Failed to load the stats UI HTML file");
			const htmlContent = await response.text();
			appElement.innerHTML = htmlContent;
		}
		catch (error)
		{
			appElement.innerHTML = `<div class="error-container">Failed to load stats interface. Please try again.</div>`;
		}
		if (this.activarEvents) {
			this.setupEventListeners(appElement);
		}
	}

	// // Sets up event listeners for stats mode buttons, which after will also set controllers
	public setupEventListeners(appElement: HTMLElement){
		const selectElement = document.getElementById("stats_select") as HTMLSelectElement | null;
		if (!selectElement) return;

				selectElement.addEventListener("change", async (event) => {
					const selectedValue = (event.target as HTMLSelectElement).value;
					switch (selectedValue) {
						case "CP":
							//llamar a la función de stats de pong
							// await getPongStats(appElement);
							getPongStats(appElement).then(() => {
								this.showOnly("pong-stats-content");
							});
							break;
						case "PT":
							//llamar a la función de stats de torneo
							getPongTournamentStats(appElement).then(() => {
								this.showOnly("pong-tournament-stats-content");
							});
							// this.showOnly("pong-tournament-stats-content");
							break;
						case "CH":
							//llamar a la función de stats de ajedrez
							// this.showOnly("chess-stats-content");
							getChessStats(appElement).then(() => {
								this.showOnly("chess-stats-content");
							});
							break;
						default:
							this.showOnly("hide_all");
							break;
					}
				});
			
		}
	}

	// 	// Stats mode buttons
	// 	document.getElementById('play-1v1')?.addEventListener('click', async () => {
	// 		await this.stats.setPlayerInfo('player1', null);
	// 		this.stats.setStatsMode('1v1');
	// 		this.showOnly('player2-login-panel');
	// 		this.setupPlayer2LoginPanel();
	// 	});
	// 	document.getElementById('play-ai')?.addEventListener('click', async () => {
	// 		await this.stats.setPlayerInfo('player1', null);
	// 		this.stats.setGuestInfo('player2', 'ai');
	// 		this.stats.setStatsMode('1vAI');
	// 		this.showOnly('config-panel');
	// 	});
	// 	document.getElementById('play-online')?.addEventListener('click', async () => {
	// 		await this.stats.setPlayerInfo('player1', null);	
	// 		this.stats.setStatsMode('remote');
	// 		this.showOnly('config-panel');
	// 	});
		
	// 	// Configuration panel elements
	// 	this.setupConfigPanelListeners();
		
	// 	// Start stats button
	// 	document.getElementById('start-stats')?.addEventListener('click', () => {
	// 		this.launchStats();
	// 	});
	// 	// Back button - returns to lobby
	// 	document.getElementById('back-button')?.addEventListener('click', () => {
	// 		this.showOnly('initial-screen', 'flex');
	// 	});
	// 	// Back button on 2nd player selection panel
	// 	document.getElementById('player2-back-btn')?.addEventListener('click', () => {
	// 		this.showOnly('initial-screen', 'flex');
	// 	});
	// 	// Refresh lobby button
	// 	document.getElementById('refresh-lobby-btn')?.addEventListener('click', () => {
	// 		this.requestStatssList();
	// 	});
	// }
	
	// public	requestStatssList()
	// {
	// 	const connection = this.stats.getStatsConnection();
	// 	if (connection.socket && connection.connectionStat)
	// 		connection.socket.send(JSON.stringify({ type: 'SHOW_GAMES' }));
	// }
	// /**
	//  * Set up listeners for the configuration panel elements
	//  */
	// private setupConfigPanelListeners(): void
	// {
	// 	// Score limit slider
	// 	const scoreSlider = document.getElementById('score-limit') as HTMLInputElement;
	// 	const scoreValue = document.getElementById('score-value');
	// 	if (scoreSlider && scoreValue)
	// 	{
	// 		scoreSlider.addEventListener('input', () => {
	// 			const value = scoreSlider.value;
	// 			if (Number(value) < 4) 
	// 			{
	// 				scoreValue.classList.remove('text-supernova-400', 'text-international-orange-400', 'text-international-orange-600');
	// 				scoreValue.classList.add('text-supernova-400');
	// 			}	
	// 			else if (Number(value) > 4 && Number(value) < 8)
	// 			{
	// 				scoreValue.classList.remove('text-supernova-400', 'text-international-orange-400', 'text-international-orange-600');
	// 				scoreValue.classList.add('text-international-orange-400');
	// 			}
	// 			else
	// 			{	
	// 				scoreValue.classList.remove('text-supernova-400', 'text-international-orange-400', 'text-international-orange-600');
	// 				scoreValue.classList.add('text-international-orange-600');
	// 			}
	// 			scoreValue.textContent = value;
	// 			this.stats.getStatsConfig().scoreLimit = parseInt(value);
	// 		});
	// 	}
		
	// 	// Difficulty slider
	// 	const difficultySlider = document.getElementById('difficulty') as HTMLInputElement;
	// 	const difficultyValue = document.getElementById('difficulty-value');
	// 	if (difficultySlider && difficultyValue)
	// 	{
	// 		difficultySlider.addEventListener('input', () => {
	// 			const value = parseInt(difficultySlider.value);
	// 			let difficultyText = 'Medium';
	// 			difficultyValue.classList.remove('text-supernova-400', 'text-international-orange-400', 'text-international-orange-600');
	// 			difficultyValue.classList.add('text-international-orange-400');
	// 			let difficultyLevel: 'easy' | 'medium' | 'hard' = 'medium';
	// 			if (value === 1)
	// 			{
	// 				difficultyText = 'Easy';
	// 				difficultyLevel = 'easy';
	// 				difficultyValue.classList.remove('text-supernova-400', 'text-international-orange-600', 'text-international-orange-400');
	// 				difficultyValue.classList.add('text-supernova-400');
	// 			}
	// 			else if (value === 3)
	// 			{
	// 				difficultyText = 'Hard';
	// 				difficultyLevel = 'hard';
	// 				difficultyValue.classList.remove('text-supernova-400', 'text-international-orange-600', 'text-international-orange-400');
	// 				difficultyValue.classList.add('text-international-orange-600');
	// 			}
	// 			difficultyValue.textContent = difficultyText;
	// 			this.stats.getStatsConfig().difficulty = difficultyLevel;
	// 		});
	// 	}
	// }
	
	// private setupPlayer2LoginPanel(): void
	// {
	// 	const	loginPanel = document.getElementById('player2-login-panel');
	// 	const	configPanel = document.getElementById('config-panel');
	// 	const	loginForm = document.getElementById('player2-login-form') as HTMLFormElement;
	// 	const	guestBtn = document.getElementById('player2-guest-btn');
	// 	const	errorMsg = document.getElementById('player2-login-error');

	// 	if (!loginPanel || !loginForm || !guestBtn || !configPanel)
	// 		return;

	// 	// Handle registered user login
	// 	loginForm.onsubmit = async (e) => {
	// 		e.preventDefault();
	// 		const email = (document.getElementById('player2-email') as HTMLInputElement).value;
	// 		const password = (document.getElementById('player2-password') as HTMLInputElement).value;
	// 		const success = await this.stats.getStatsConnection().checkPlayer({ email, password });
			
	// 		if (!email || !password)
	// 		{
	// 			if (errorMsg)
	// 				errorMsg.textContent = 'Please enter both email and password';
	// 			return;
	// 		}

	// 		if (success)
	// 		{
	// 			this.stats.setPlayerInfo('player2', { email, password });
	// 			this.showOnly('config-panel');
	// 			if (errorMsg) errorMsg.textContent = '';
	// 		}
	// 		else
	// 			if (errorMsg) errorMsg.textContent = 'Invalid email or password. Please try again';
	// 	};

	// 	// Handle guest
	// 	guestBtn.onclick = () => {
	// 		this.stats.setGuestInfo('player2', 'guest');
	// 		this.showOnly('config-panel');
	// 		if (errorMsg)
	// 			errorMsg.textContent = '';
	// 	};
	// }

	// public launchStats(): void 
	// {
	// 	if (!this.stats.getStatsConnection().socket || !this.stats.getStatsConnection().connectionStat)
	// 	{
	// 		return ;
	// 	}
	// 	this.stats.setStatsConfig(this.stats.getStatsConfig());
	// 	this.stats.getStatsConnection().joinStats();
	// }

	// public	updateLobby(statss: StatsData[]): void
	// {
	// 	const lobbyDiv = document.getElementById('lobby-statss-list');
	// 	if (!lobbyDiv)
	// 		return;
	// 	lobbyDiv.innerHTML = '';
	// 	if (!statss || statss.length === 0)
	// 	{
	// 		lobbyDiv.innerHTML = '<div class="text-white text-center">No statss available.</div>';
	// 		return ;
	// 	}
	// 	// Per each stats returned by backend, we create a new stats card and append it to lobbyDiv
	// 	// TODO: we can add more elements to the card as "Ready, Full, In progress"...
	// 	statss.forEach((stats: StatsData) => {
	// 		const card = document.createElement('div');
	// 		card.className = 'bg-pong-primary rounded p-4 flex flex-col gap-2 border-1 border-pong-tertiary shadow-md';
	// 		const DifficultyColor = stats.config?.difficulty === 'easy' ? 'text-supernova-400' : stats.config?.difficulty === 'medium' ? 'text-international-orange-400' : 'text-international-orange-600';
	// 		const scoreColor = (stats.config?.scoreLimit && stats.config.scoreLimit < 4) ? 'text-supernova-400' : (stats.config?.scoreLimit && stats.config.scoreLimit < 8) ? 'text-international-orange-400' : 'text-international-orange-600';
	// 		card.innerHTML = `
	// 			<div class="text-white font-medium">Stats ID: <span class="font-bold">${stats.id}</span></div>
	// 			<hr class="border-candlelight-400"/>
	// 			<div class="text-pong-text-secondary">Host: <span class="text-international-orange-400">${stats.playerDetails.player1?.username}</span></div>
	// 			<div class="text-pong-text-secondary">Limit score: <span class="${scoreColor}">${stats.config?.scoreLimit}</span></div>
	// 			<div class="text-pong-text-secondary">Difficulty: <span class="${DifficultyColor}">${stats.config?.difficulty}</span></div>
	// 			<button class="join-stats-btn btn-pong-secondary rounded px-3 py-2 mt-2" data-statsid="${stats.id}">Join</button>
	// 		`;
	// 		lobbyDiv.appendChild(card);
	// 	});
	// 	// Join stats button - copy the stats.lod metadata and uses to call JOIN API endpoint (should work)
	// 	// TODO: protect errors like stats full or maybe only allow click event when 100% sure is the right moment
	// 	lobbyDiv.querySelectorAll('.join-stats-btn').forEach(btn => {
	// 		btn.addEventListener('click', (e) => {
	// 			const statsId = (e.target as HTMLElement).getAttribute('data-statsid');
	// 			if (statsId)
	// 			{	
	// 				this.stats.setStatsIsHost(false);
	// 				this.stats.getStatsConnection().joinStats(statsId);
	// 			}
	// 		});
	// 	});
	// }
// }
