import { fetchUserData, fetchUserStats, fetchFriendEntries, sendFriendRequest } from "./userProfileFetchers.js";
import { checkFriendStatus, rejectFriendRequest, deleteFriend, blockUser, unblockUser } from "./userProfileActions.js";
import { getFriendButton, getBlockUserButton } from "./userProfileButtons.js";

export async function showUserProfile(userId: string, username: string, event?: MouseEvent) {
	const existingProfile = document.getElementById("user-profile-modal-backdrop");
	if (existingProfile) existingProfile.remove();

	const userData = await fetchUserData(userId);
	const userStats = await fetchUserStats(userId);
	const friendsEntries = await fetchFriendEntries(userId);
	if (!userData || !userStats || !friendsEntries) {
		console.log("Error fetching user data or stats.");
		return;
	}

	const { isFriend, isPending, isBlocked } = await checkFriendStatus(userId, friendsEntries);

	const friendButton = getFriendButton(isFriend, isPending, isBlocked);

	const playButton = !isBlocked
    ? `<button id="play-btn" class="bg-green-600 hover:bg-green-400 text-white px-6 py-2 rounded-lg font-semibold shadow">🎮 Play Game</button>`
    : "";

	const blockUserButton = getBlockUserButton(isBlocked, userId);

	// Fondo semitransparente que NO cubre el header (ajusta top-[64px] si tu header es más alto o bajo)
	const backdrop = createBackdrop();
	// Modal centrado con transparencia
	const modal = document.createElement("div");
	modal.className = "bg-gray/900 backdrop-blur-md rounded-xl shadow-2xl p-10 w-full max-w-2xl border-1 border-blue-500 relative scale-95 opacity-0";
	modal.style.transition = "opacity 0.5s, transform 0.5s";

	modal.innerHTML = `
		<button id="close-profile-modal" class="absolute top-4 right-6 text-blue-500 hover:text-blue-700 text-4xl font-bold">&times;</button>
		<div class="flex flex-col items-center text-white">
			<img src="${userData.avatarPath}" alt="Avatar" class="w-40 h-40 rounded-full mb-6 border-4 border-blue-500 shadow">
			<h2 class="text-3xl font-extrabold mb-2 text-blue-500">${username}</h2>
			<ul class="mb-8 text-lg">
				<li><span class="font-semibold">🎮  Partidas jugadas:</span> ${userStats.totalGames}</li>
				<li><span class="font-semibold">🏆  Victorias:</span> ${userStats.wins}</li>
				<li><span class="font-semibold">❌  Derrotas:</span> ${userStats.losses}</li>
			</ul>
			<div class="flex gap-4 mt-2">
				${playButton}
				${friendButton}
				${blockUserButton}
			</div>
		</div>
	`;

	backdrop.appendChild(modal);
	document.body.appendChild(backdrop);

	setTimeout(() => {
		modal.style.opacity = "1";
		modal.style.transform = "scale(1)";
	}, 10);

	window.history.pushState({ modalOpen: true }, "");

	addProfileModalListeners(userId, backdrop);
}

function addProfileModalListeners(userId: string, backdrop: HTMLDivElement) {
	const closeModal = () => {
		backdrop.remove();
		window.removeEventListener("popstate", onPopState);
		if (window.history.state && window.history.state.modalOpen) {
			window.history.back();
		}
	};

    const onPopState = () => {
        closeModal();
    };
	
	window.addEventListener("popstate", onPopState);

	backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) closeModal();
    });

	document.getElementById("close-profile-modal")?.addEventListener("click", () => {
		backdrop.remove();
	});
	document.getElementById("play-btn")?.addEventListener("click", () => {
		alert("Feature not implemented yet: Play Game with this user");
		backdrop.remove();
	});
	document.getElementById("add-friend-btn")?.addEventListener("click", () => {
		sendFriendRequest(userId);
		backdrop.remove();
	});

	document.getElementById("cancel-friend-btn")?.addEventListener("click", async () => {
		await rejectFriendRequest(userId);
		backdrop.remove();
	});

	document.getElementById("del-friend-btn")?.addEventListener("click", () => {
		deleteFriend(userId);
		backdrop.remove();
	});
	document.getElementById("block-user-btn")?.addEventListener("click", () => {
		blockUser(userId);
		backdrop.remove();
	});
	document.getElementById("unblock-user-btn")?.addEventListener("click", () => {
		unblockUser(userId);
		backdrop.remove();
	});
	backdrop.addEventListener("click", (e) => {
		if (e.target === backdrop) backdrop.remove();
	});
}

function createBackdrop(): HTMLDivElement {
	const backdrop = document.createElement("div");
	backdrop.id = "user-profile-modal-backdrop";
	backdrop.className = "fixed left-0 right-0 bottom-0 top-[160px] bg-black/50 flex items-center justify-center z-40";
	backdrop.style.animation = "fadeIn 0.2s";
	return backdrop;
}