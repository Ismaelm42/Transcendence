import Chess from "./chessRender";
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

export async function saveChessGame(data: any): Promise<void>  {
		console.log("saveChessGame: ", data);
		let Chessgamelog = {
			user1: data.hostId,
			user2: data.hostId && data.hostId !== data.guestId ? data.guestId : -2, // -2 for guest player
			draw: false,
			winner: (data.winner === "Guest") ? -2 : data.winnerId,
			loser: (data.loser === "Guest") ? -2 : data.loserId,
			winnerStr: data.winner,
			loserStr: data.loser,
			color: data.color,
			endtype: data.type,
		};
	
		if(Chessgamelog.user2 === null || Chessgamelog.user2 === undefined
			|| Chessgamelog.user1 === null || Chessgamelog.user1 === undefined)
		{
			if (data.winner === "Guest" || data.loser === "Guest") {
				Chessgamelog.user2 = -2; // -2 for guest player
			} else {
				Chessgamelog.user1 = data.winnerId;
				Chessgamelog.user2 = data.loserId;
			}
		}
		// If draw, set winner and loser to null
		if (data.type === "agreement"){
			Chessgamelog.draw = true;
			Chessgamelog.winner = null;
			Chessgamelog.loser = null;
			Chessgamelog.winnerStr = null;
			Chessgamelog.loserStr = null;
		}
		console.log("Chessgamelog to be sent: ", Chessgamelog);
		try {
			const response = await fetch("https://localhost:8443/back/post_chessgamelog", {
				method: "POST",
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(Chessgamelog)
			});
			const result = await response.json();
			if (!response.ok) {
				console.log(`Error: ${result.message}`);
			} else {
				if (result && result.id && result.id == -42)
					console.log("Online game: Game log already saved by the host: ", result);
				else
					console.log("Game log saved successfully:", result);
			}
		} catch (error) {
			console.error("Error while verifying:", error);
		}
	}


export function showGameOverOptions(data: any) {

	showBoardOverlay();
	showSidebarOverlay();
	hideConfirmationDraw();
	hideConfirmationResign();
	hideRequestDrawOptions();
	saveChessGame(data);
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
