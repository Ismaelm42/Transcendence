import { rejectRematch } from "./handleSenders";

export function hidePromotionOptions() {

	document.getElementById("board-overlay")?.classList.add("hidden");
	document.getElementById("modal-promotion")?.classList.add("hidden");
}


export function showPromotionOptions() {

	document.getElementById("board-overlay")?.classList.remove("hidden");
	document.getElementById("modal-promotion")?.classList.remove("hidden");
}

export function hideBoardOverlay() {

	document.getElementById("board-overlay")?.classList.add("hidden");
}

export function showBoardOverlay() {

	document.getElementById("board-overlay")?.classList.remove("hidden");
}

export function hideSidebarOverlay() {

	document.getElementById("sidebar-overlay")?.classList.add("hidden");
}

export function showSidebarOverlay() {

	document.getElementById("sidebar-overlay")?.classList.remove("hidden");
}

export function hideGameOverOptions() {

	document.getElementById("modal-game-over")?.classList.add("hidden");
}

export function showGameOverOptions(data: any) {

	showBoardOverlay();
	showSidebarOverlay();
	hideConfirmationDraw();
	hideConfirmationResign();
	hideRequestDrawOptions();
	document.getElementById("modal-game-over")?.classList.remove("hidden");
	document.getElementById("draw")?.classList.add("hidden");
	document.getElementById("resign")?.classList.add("hidden");
	document.getElementById("return")?.classList.remove("hidden");
	if (data.winner) {
		document.getElementById("game-result")!.classList.remove("hidden");
		document.getElementById("winner-name")!.textContent = data.winner;
		document.getElementById("end-reason")!.textContent = 'by ' + data.type;
	}
	else {
		document.getElementById("draw-result")!.classList.remove("hidden");
		document.getElementById("draw-reason")!.textContent = 'by ' + data.type;
	}
}

export function hideRequestRematchOptions() {

	document.getElementById("modal-rematch")?.classList.add("hidden");
}

export function showRequestRematchOptions(data: any) {

	hideGameOverOptions();
	document.getElementById("modal-rematch")!.classList.remove("hidden");
	const message = document.getElementById("rematch-options-message");

	let timeLeft = 10.0;
	message!.textContent = data.username + ' has invited you to a rematch ' + timeLeft.toFixed(1);

	const intervalId = setInterval(() => {
		timeLeft -= 0.1;
		if (timeLeft <= 0) {
			clearInterval(intervalId);
			message!.textContent = data.username + ' has invited you to a rematch 0.0';
			hideRequestRematchOptions();
			hideSidebarOverlay();
		}
		else
			message!.textContent = data.username + ' has invited you to a rematch ' + timeLeft.toFixed(1);
	}, 100);
}

export function hideRequestRematchWaiting() {

	document.getElementById("modal-rematch-waiting")?.classList.add("hidden");
}

export function showRequestRematchWaiting() {

	const message = document.getElementById("rematch-waiting-message");
	document.getElementById("modal-rematch-waiting")!.classList.remove("hidden");

	let timeLeft = 10.0;
	message!.textContent = 'Waiting for opponent ' + timeLeft.toFixed(1);

	const intervalId = setInterval(() => {
		timeLeft -= 0.1;
		if (timeLeft <= 0) {
			clearInterval(intervalId);
			message!.textContent = 'Waiting for opponent 0.0';
			hideRequestRematchWaiting();
			hideSidebarOverlay();
		}
		else
			message!.textContent = 'Waiting for opponent ' + timeLeft.toFixed(1);
	}, 100);
}

export function hideResponseRematchDeclined() {

	document.getElementById("modal-rematch-declined")?.classList.add("hidden");
}

export function showResponseRematchDeclined(data: any) {

	hideRequestRematchWaiting();
	document.getElementById("modal-rematch-declined")!.classList.remove("hidden");
	document.getElementById("declined-reason")!.textContent = data.opponentName + ' ' + data.reason;
}

export function hideConfirmationDraw() {

document.getElementById("modal-confirmDraw")?.classList.add("hidden");
}

export function showConfirmationDraw() {

	document.getElementById("modal-confirmResign")?.classList.add("hidden");
	document.getElementById("modal-confirmDraw")?.classList.remove("hidden");
}

export function hideConfirmationResign() {

	document.getElementById("modal-confirmResign")?.classList.add("hidden");
}

export function showConfirmationResign() {

	document.getElementById("modal-confirmDraw")?.classList.add("hidden");
	document.getElementById("modal-confirmResign")?.classList.remove("hidden");
}

export function hideRequestDrawOptions() {

	document.getElementById("modal-requestDraw")!.classList.add("hidden");
}

export function showRequestDrawOptions(data: any) {

	document.getElementById("modal-requestDraw")!.classList.remove("hidden");
	const message = document.getElementById("requestDraw-options-message");
	message!.textContent = data.username + ' ' + 'offered a draw';
}

export function hideReplayOverlay() {

	document.getElementById("replay-overlay")?.classList.add("hidden");
}


export function showReplayOverlay() {

	document.getElementById("replay-overlay")?.classList.remove("hidden");
}
