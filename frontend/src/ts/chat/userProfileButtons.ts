export function getFriendButton(isFriend: boolean, isPending: boolean, isBlocked: boolean): string {
	let friendButton = "";
	if (isFriend && !isBlocked) {
		friendButton = `<button id="del-friend-btn" class="bg-gray-600 hover:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold shadow">✔️ Friend</button>`;
	} else if (isPending && !isBlocked) {
		friendButton = `<button id="cancel-friend-btn" class="bg-yellow-600 hover:bg-yellow-400 text-white px-6 py-2 rounded-lg font-semibold shadow">⏳ Pending</button>`;
	} else if (!isFriend && !isPending && !isBlocked) {
		friendButton = `<button id="add-friend-btn" class="bg-blue-600 hover:bg-blue-400 text-white px-6 py-2 rounded-lg font-semibold shadow">➕ Add Friend</button>`;
	}
	return friendButton;
}

export function getBlockUserButton(isBlocked: boolean, userId: string): string {
	let blockUserButton = "";
	if (isBlocked) {
		blockUserButton = `<button id="unblock-user-btn" class="bg-red-600 hover:bg-red-400 text-white px-6 py-2 rounded-lg font-semibold shadow">🔓 Unblock User</button>`;
	} else {
		blockUserButton = `<button id="block-user-btn" class="bg-red-600 hover:bg-red-400 text-white px-6 py-2 rounded-lg font-semibold shadow">🔒 Block User</button>`;
	}
	return blockUserButton;
}