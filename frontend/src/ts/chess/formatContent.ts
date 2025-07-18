import { userId } from './state.js';

export async function formatLobbyList(data: any): Promise<string> {

	let htmlText = '', htmlContent, lobbyHtmlContent, option, color, mode;

	const lobbies = Object.values(data.object) as { userId: string; username: string; rating: string; playerColor: string, timeControl: string }[];

	for (const lobby of lobbies) {

		lobby.userId.toString() === userId ? option = "Cancel" : option = "Join";
		lobby.userId.toString() === userId ? color = "red" : color = "emerald";

		const minutes = parseInt(lobby.timeControl.split('|')[0], 10);
		if (minutes === 1 || minutes === 2)
		    mode = "bullet";
		else if (minutes === 3 || minutes === 5)
		    mode = "blitz";
		else
		    mode = "rapid";

		lobbyHtmlContent = await fetch("../../html/chess/lobbyItem.html");
		htmlContent = await lobbyHtmlContent.text();
		htmlContent = htmlContent
		.replace("{{ userId }}", lobby.userId.toString())
		.replace("{{ id }}", lobby.userId.toString())
		.replace("{{ username }}", lobby.username.toString())
		.replace("{{ rating }}", lobby.rating.toString())
		.replace("{{ color }}", lobby.playerColor.toString())
		.replace("{{ mode }}", mode.toString())
		.replace("{{ time }}", lobby.timeControl.toString())
		.replace("{{ bg-color }}", color.toString())
		.replace("{{ hover-color }}", color.toString())
		.replace("{{option}}", option.toString());
		htmlText += htmlContent;
	}
	return htmlText;
}

