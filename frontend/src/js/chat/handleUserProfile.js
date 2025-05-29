var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { fetchUserData, fetchUserStats, fetchFriendEntries, sendFriendRequest } from "./userProfileFetchers.js";
import { checkFriendStatus, rejectFriendRequest, deleteFriend, blockUser, unblockUser } from "./userProfileActions.js";
import { getFriendButton, getBlockUserButton } from "./userProfileButtons.js";
export function showUserProfile(userId, username, event) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingProfile = document.getElementById("user-profile-modal-backdrop");
        if (existingProfile)
            existingProfile.remove();
        const userData = yield fetchUserData(userId);
        const userStats = yield fetchUserStats(userId);
        const friendsEntries = yield fetchFriendEntries(userId);
        if (!userData || !userStats || !friendsEntries) {
            console.log("Error fetching user data or stats.");
            return;
        }
        const { isFriend, isPending, isBlocked } = yield checkFriendStatus(userId, friendsEntries);
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
    });
}
function addProfileModalListeners(userId, backdrop) {
    var _a, _b, _c, _d, _e, _f, _g;
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
        if (e.target === backdrop)
            closeModal();
    });
    (_a = document.getElementById("close-profile-modal")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
        backdrop.remove();
    });
    (_b = document.getElementById("play-btn")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
        alert("Feature not implemented yet: Play Game with this user");
        backdrop.remove();
    });
    (_c = document.getElementById("add-friend-btn")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => {
        sendFriendRequest(userId);
        backdrop.remove();
    });
    (_d = document.getElementById("cancel-friend-btn")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
        yield rejectFriendRequest(userId);
        backdrop.remove();
    }));
    (_e = document.getElementById("del-friend-btn")) === null || _e === void 0 ? void 0 : _e.addEventListener("click", () => {
        deleteFriend(userId);
        backdrop.remove();
    });
    (_f = document.getElementById("block-user-btn")) === null || _f === void 0 ? void 0 : _f.addEventListener("click", () => {
        blockUser(userId);
        backdrop.remove();
    });
    (_g = document.getElementById("unblock-user-btn")) === null || _g === void 0 ? void 0 : _g.addEventListener("click", () => {
        unblockUser(userId);
        backdrop.remove();
    });
    backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop)
            backdrop.remove();
    });
}
function createBackdrop() {
    const backdrop = document.createElement("div");
    backdrop.id = "user-profile-modal-backdrop";
    backdrop.className = "fixed left-0 right-0 bottom-0 top-[160px] bg-black/50 flex items-center justify-center z-40";
    backdrop.style.animation = "fadeIn 0.2s";
    return backdrop;
}
