export function showMessage(message: string, time: number | null): void {
	const messageContainer = document.getElementById("message-container");
	const messageContent = document.getElementById("message-content");
	const closeButton = document.getElementById("close-message");

	if (!messageContainer || !messageContent || !closeButton) {
		console.error("Required elements are missing in the DOM.");
		return;
	}

	// Set the message content and make the container visible
	messageContent.innerHTML = message;
	messageContainer.classList.remove("hidden");

	// Focus the close button so Enter will trigger it
	closeButton.focus();

	// Close button event listener
	const closeHandler = (event: Event) => {
		event.preventDefault();
		messageContainer.classList.add("hidden");
		closeButton.removeEventListener("click", closeHandler);
		closeButton.removeEventListener("keydown", keydownHandler);
	};
	closeButton.addEventListener("click", closeHandler);

	// Allow closing with Enter key
	const keydownHandler = (event: KeyboardEvent) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			closeHandler(event);
		}
	};
	closeButton.addEventListener("keydown", keydownHandler);

	// If a time is provided, hide the message after the specified time
	if (time !== null) {
		setTimeout(() => {
			messageContainer.classList.add("hidden");
			closeButton.removeEventListener("click", closeHandler);
			closeButton.removeEventListener("keydown", keydownHandler);
		}, time);
	}
}

export function showWinnerMessage(message: string, time: number | null): void {
	console.log("showWinnerMessage called with message:", message, "and time:", time);
	const messageContainer = document.getElementById("winner-message-container");
	const messageContent = document.getElementById("winner-message-content");
	const closeButton = document.getElementById("close-winner-message");

	if (!messageContainer || !messageContent || !closeButton) {
		console.error("Required elements are missing in the DOM.");
		return;
	}

	// Set the message content and make the container visible
	messageContent.innerHTML = message;
	messageContainer.classList.remove("hidden");

	// Focus the close button so Enter will trigger it
	closeButton.focus();

	// Close button event listener
	const closeHandler = (event: Event) => {
		event?.preventDefault();
		messageContainer.classList.add("hidden");
		closeButton.removeEventListener("click", closeHandler);
	};
	closeButton.addEventListener("click", closeHandler);

		// Allow closing with Enter key
	const keydownHandler = (event: KeyboardEvent) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			closeHandler(event);
		}
	};
	closeButton.addEventListener("keydown", keydownHandler);

	// If a time is provided, hide the message after the specified time
	if (time !== null) {
		setTimeout(() => {
			messageContainer.classList.add("hidden");
			closeButton.removeEventListener("click", closeHandler);
		}, time);
	}
}

/**
 * Shows a confirmation dialog before leaving the game-match step.
 * Returns a Promise<boolean>: true if user confirms, false otherwise.
 */
export function showConfirmDialog(message: string): Promise<boolean>
{
	return new Promise((resolve) => {
		const overlay = document.getElementById("confirm-dialog-overlay");
		const content = document.getElementById("confirm-dialog-content");
		const yesBtn = document.getElementById("confirm-dialog-yes");
		const noBtn = document.getElementById("confirm-dialog-no");

		if (!overlay || !content || !yesBtn || !noBtn)
		{
			console.error("Confirm dialog elements missing in DOM.");
			resolve(false);
			return ;
		}

		content.innerHTML = message;
		overlay.classList.remove("hidden");
		overlay.style.display = "flex";
		yesBtn.focus();

		const cleanup = () => {
			overlay.classList.add("hidden");
			overlay.style.display = "none";
			yesBtn.removeEventListener("click", onYes);
			noBtn.removeEventListener("click", onNo);
			overlay.removeEventListener("keydown", onKeyDown);
		};

		const onYes = (e: Event) => {
			e.preventDefault();
			cleanup();
			resolve(true);
		};
		const onNo = (e: Event) => {
			e.preventDefault();
			cleanup();
			
			resolve(false);
		};
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Enter") onYes(e);
			if (e.key === "Escape") onNo(e);
		};

		yesBtn.addEventListener("click", onYes);
		noBtn.addEventListener("click", onNo);
		overlay.addEventListener("keydown", onKeyDown);
		// Keep focus on the primary (Yes) button for better accessibility instead of moving it to the overlay.
	});
}
