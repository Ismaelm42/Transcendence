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