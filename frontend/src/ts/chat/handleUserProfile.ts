import { fetchUserData, fetchUserStats, fetchFriendEntries, sendFriendRequest, acceptFriendRequest } from "./userProfileFetchers.js";
import { checkFriendStatus, rejectFriendRequest, deleteFriend, blockUser, unblockUser, canAcceptRequest} from "./userProfileActions.js";
import { getFriendButton, getBlockUserButton } from "./userProfileButtons.js";

export async function showUserProfile(currentUserId: string, userId: string, username: string, event?: MouseEvent) {
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

const canAccept = isPending && canAcceptRequest(userId, friendsEntries, currentUserId);

const acceptDeclineButton = canAccept
    ? `
        <button id="accept-friend-btn" class="flex items-center gap-1 bg-blue-600 hover:bg-blue-400 text-white px-6 py-2 rounded-lg font-semibold shadow">
		<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
  		<path d="M7 22V10M7 10l5-7v7h5a2 2 0 0 1 2 2v2.5a2 2 0 0 1-2 2H7" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>Accept</button>
        <button id="decline-friend-btn" class="flex items-center gap-2 bg-orange-600 hover:bg-orange-400 text-white px-6 py-2 rounded-lg font-semibold shadow">
		<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
  		<path d="M7 2v12m0 0l5 7v-7h5a2 2 0 0 0 2-2V9.5a2 2 0 0 0-2-2H7" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>Decline</button>
        `
    : "";

const friendButton = !canAccept
    ? getFriendButton(isFriend, isPending, isBlocked, canAccept)
    : "";
		
	const playButton = !isBlocked
    ? `<button id="play-btn" class="bg-green-600 hover:bg-green-400 text-white px-6 py-2 rounded-lg font-semibold shadow">🎮 Play Game</button>`
    : "";

	const blockedByMe = isBlockedByCurrentUser(userId, friendsEntries, currentUserId);
	const blockedByOther = isBlockedByOther(userId, friendsEntries, currentUserId);
	let blockUserButton = "";
	if (blockedByMe) {
		blockUserButton = getBlockUserButton(isBlocked, userId); // Mostrar "Unblock"
	} else if (!blockedByOther) {
		blockUserButton = getBlockUserButton(isBlocked, userId); // Mostrar "Block"
	}

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
				${acceptDeclineButton}
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
	document.getElementById("accept-friend-btn")?.addEventListener("click", async () => {
 	 	await acceptFriendRequest(userId);
		backdrop.remove();
	});

	document.getElementById("decline-friend-btn")?.addEventListener("click", async () => {
  		await rejectFriendRequest(userId);
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

export function isBlockedByCurrentUser(userId: string, friendsEntries: any[], currentUserId: string): boolean {
    return friendsEntries.some(
        (entry: any) =>
            entry.status === "blocked" &&
            String(entry.userId) === String(currentUserId) && // El usuario actual bloqueó
            String(entry.friendId) === String(userId)         // Al usuario del perfil
    );
}

export function isBlockedByOther(userId: string, friendsEntries: any[], currentUserId: string): boolean {
    return friendsEntries.some(
        (entry: any) =>
            entry.status === "blocked" &&
            String(entry.userId) === String(userId) &&        // El usuario del perfil bloqueó
            String(entry.friendId) === String(currentUserId)   // Al usuario actual
    );
}