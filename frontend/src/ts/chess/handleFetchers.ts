export async function getLaunchGameHtml(): Promise<string> {

	const htmlContent = await fetch("../../html/chess/launchGame.html");
	if (!htmlContent.ok)
		throw new Error("Failed to load the HTML file");
	const htmlText = await htmlContent.text();
	return htmlText;
}

export async function getChessHtml(): Promise<string> {

	const htmlContent = await fetch("../../html/chess/chess.html");
	if (!htmlContent.ok)
		throw new Error("Failed to load the HTML file");
	const htmlText = await htmlContent.text();
	return htmlText;
}

export async function getUserId(username: string): Promise<string> {

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
	return id.text();
}
