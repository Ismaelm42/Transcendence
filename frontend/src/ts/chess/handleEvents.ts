import { setupChessboard } from './drawChessboard.js'

function getClickedSquare(event: MouseEvent, canvas: HTMLCanvasElement): string | null {

	const rect = canvas.getBoundingClientRect();
	const scaleX = canvas.width / rect.width;
	const scaleY = canvas.height / rect.height;
	const x = (event.clientX - rect.left) * scaleX;
	const y = (event.clientY - rect.top) * scaleY;
	const squareSize = canvas.width / 8;
	const col = Math.floor(x / squareSize);
	const row = Math.floor(y / squareSize);
	if (col < 0 || col > 7 || row < 0 || row > 7) {
		return null;
	}
	const file = String.fromCharCode(97 + col);
	const rank = 8 - row;
	console.log(`You clicked on: ${file}${rank}`);
	return `${file}${rank}`;
}

export function handleEvents(canvas: HTMLCanvasElement) {

	canvas.addEventListener("click", (event) => {
		const square = getClickedSquare(event, canvas);
	});
	window.addEventListener("resize", () => {
		console.log("HOLAAAA")
		requestAnimationFrame(() => {
		setupChessboard(canvas);
		});	
	});

}
