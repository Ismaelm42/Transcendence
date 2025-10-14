import { Step } from '../spa/stepRender.js';
import { handleStats } from './handleStats.js'; 
import { StatsUI } from './StatsUI.js';

const DEFAULT_CONTAINER_ID = "stats-container";

export default class Stats extends Step {

		protected	ui: StatsUI;
		constructor(containerId: string = DEFAULT_CONTAINER_ID, id?: string)
		{
			super(containerId);
			this.ui = new StatsUI(this);
		}

	async render(appElement: HTMLElement): Promise<void>
	{
		await this.ui.initializeUI(appElement);
	}
}