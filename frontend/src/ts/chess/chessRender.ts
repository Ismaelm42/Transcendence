import { Step } from '../spa/stepRender.js'
import { setAppContainer, setUserId, setSocket } from './state.js'
import { checkIfGameIsRunning, launchGame, launchUI } from './launchGame.js'
import { handleSocketEvents } from './handleSocketEvents.js'

export default class Chess extends Step {

	async render(appElement: HTMLElement): Promise<void> {
		sessionStorage.setItem("current-view", "Chess");
		if (!this.username) {
			this.username = await this.checkAuth();
		}
		try {
			await setUserId(this.username!);
			setAppContainer(appElement);
			setSocket(Step.socket);
			handleSocketEvents();
			const data = checkIfGameIsRunning();
			if (!data)
				launchUI();
			else
				launchGame(data);
		}
		catch (error) {
			console.log(error);
			appElement.innerHTML = `<div id="pong-container">An error occurred while generating the content</div>`;
		}
	}
}
