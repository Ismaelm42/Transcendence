export function showMessage(message, time) {
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
    // Close button event listener
    const closeHandler = () => {
        messageContainer.classList.add("hidden");
        closeButton.removeEventListener("click", closeHandler);
    };
    closeButton.addEventListener("click", closeHandler);
    // If a time is provided, hide the message after the specified time
    if (time !== null) {
        setTimeout(() => {
            messageContainer.classList.add("hidden");
            closeButton.removeEventListener("click", closeHandler);
        }, time);
    }
}
