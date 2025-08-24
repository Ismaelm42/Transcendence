import { Step } from '../spa/stepRender.js'
import { Chessboard } from './chessboardClass.js';

export let userId: string | null = null;
export let socket: WebSocket | null = null;
export let chessboard: Chessboard | null = null;
export let canvas: HTMLCanvasElement | null = null;
export let appContainer: HTMLElement | null = null;
export let data: any | null = null;

export function setAppContainer(appElement: HTMLElement) {

	appContainer = appElement;
}

export async function setUserId(username: string) {

	const id = await fetch("https://localhost:8443/back/getIdByUsername", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			username: username
		}),
	});
	if (!id.ok)
		throw new Error("Failed to fetch user ID");
	userId = await id.text();
}

export function setSocket() {

	if (!Step.chessSocket || Step.chessSocket.readyState === WebSocket.CLOSED)
	{
		Step.chessSocket = new WebSocket("https://localhost:8443/back/ws/chess");
		socket = Step.chessSocket;
	}
	else
		socket = Step.chessSocket;
}

export function setChessboard(data: any) {

	chessboard = new Chessboard(data);
}

export function setCanvas() {

	const board = document.getElementById("board") as HTMLDivElement;
	canvas = document.createElement("canvas");
	canvas.style.width = "100%";
	canvas.style.height = "100%";
	canvas.style.display = "block";
	board.insertBefore(canvas, board.firstChild);
}

export function setData(newData: any) {

	data = newData;
}
