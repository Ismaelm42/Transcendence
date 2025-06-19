import { Step } from '../spa/stepRender.js';
import { Chessboard } from './chessboardClass.js'
import { getChessHtml, getUserId } from './handleFetchers.js';
import { handleEvents } from './handleEvents.js'
import { createCanvas, preloadImages, setupChessboard } from './drawChessboard.js'

export default class Chess extends Step {

	async render(appElement: HTMLElement): Promise<void> {
		sessionStorage.setItem("current-view", "Chess");
		if (!this.username) {
			this.username = await this.checkAuth();
		}
		try {
			
			appElement.innerHTML = await getChessHtml();
			const board = document.getElementById("board") as HTMLDivElement;
			const userId = await getUserId(this.username!);

			const chessboard = new Chessboard();
			chessboard.init();
			const canvas = createCanvas(board);
			preloadImages(()=>{ 
				setupChessboard(chessboard, canvas, null, null);
				handleEvents(chessboard, canvas);
			});
		}
		catch (error) {
			console.log(error);
			appElement.innerHTML = `<div id="pong-container">An error occurred while generating the content</div>`;
		}
	}
}
