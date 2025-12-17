import { showMessage } from "../modal/showMessage.js";

export async function checkFriendStatus(userId: string, friendsEntries: any[]): Promise<{ isFriend: boolean; isPending: boolean; isBlocked: boolean }> {
	const blockedFriends = friendsEntries.filter((entry: any) => entry.status === "blocked");

	const isBlocked = blockedFriends.some((entry: any) =>
		String(entry.friendId) === String(userId) || String(entry.userId) === String(userId)
	);

	// Filtra solo los amigos aceptados
	const acceptedFriends = friendsEntries.filter((entry: any) => entry.status === "accepted");

	const pendingFriends = friendsEntries.filter((entry: any) => entry.status === "pending");

	// Comprueba si el userId mostrado es amigo
	const isFriend = acceptedFriends.some((entry: any) =>
		String(entry.friendId) === String(userId) || String(entry.userId) === String(userId)
	);

	const isPending = pendingFriends.some((entry: any) =>
		String(entry.friendId) === String(userId) || String(entry.userId) === String(userId)
	);

	return { isFriend, isPending, isBlocked };
}

export function canAcceptRequest(userId: string, friendsEntries: any[], currentUserId: string): boolean {
    const result = friendsEntries.some(
        (entry: any) =>
            entry.status === "pending" &&
            String(entry.userId) === String(userId) &&
            String(entry.friendId) === String(currentUserId)
    );
    return result;
}

export async function rejectFriendRequest(userId: string): Promise<void> {
	try {
		const response = await fetch(`https://${window.location.host}/back/reject_friend_request`, {
			method: "POST",
			credentials: 'include',
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ friendId: userId }),
		});
		if (response.ok) {
			showMessage("Friend request cancelled", null);
		}
	} catch (error) {
	}
}

export async function deleteFriend(userId: string) {
	try {
		const response = await fetch(`https://${window.location.host}/back/delete_friend`, {
			method: "POST",
			credentials: 'include',
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ friendId: userId }),
		});
		if (response.ok) {
			showMessage("Friend deleted", null);
		}
	} catch (error) {
	}
}

export async function blockUser(userId: string) {
	try {
		const response = await fetch(`https://${window.location.host}/back/block_user`, {
			method: "POST",
			credentials: 'include',
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ friendId: userId }),
		});
		if (response.ok) {
			showMessage("User blocked", null);
		}
	} catch (error) {
	}
}

export async function unblockUser(userId: string) {
	try {
		const response = await fetch(`https://${window.location.host}/back/unblock_user`, {
			method: "POST",
			credentials: 'include',
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ friendId: userId }),
		});
		if (response.ok) {
			showMessage("User unblocked", null);
		}
	} catch (error) {
	}
}

export function openPrivateChat(username: string) {
	let privateChat = document.getElementById("private-chat");
	if (privateChat) {
		privateChat.remove();
	}
}
