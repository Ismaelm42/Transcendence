import { Step } from '../spa/stepRender.js'
import { handleSocketEvents } from './handleSocketEvents.js';
import { setAppContainer, setUserId, setSocket } from './state.js'
import { waitForSocketOpen, checkIfGameIsRunning } from './handleSenders.js';

export default class Chess extends Step {

	async render(appElement: HTMLElement): Promise<void> {
		sessionStorage.setItem("current-view", "Chess");
		if (!this.username) {
			this.username = await this.checkAuth();
		}
		try {
			await setUserId(this.username!);
			setAppContainer(appElement);
			setSocket();
			handleSocketEvents();
			await waitForSocketOpen();
			checkIfGameIsRunning();
		}
		catch (error) {
			appElement.innerHTML = `<div id="pong-container">An error occurred while generating the content</div>`;
		}
	}
}
