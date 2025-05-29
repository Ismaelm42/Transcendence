
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

export async function rejectFriendRequest(userId: string): Promise<void> {
	try {
		const response = await fetch("https://localhost:8443/back/reject_friend_request", {
			method: "POST",
			credentials: 'include',
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ friendId: userId }),
		});
		if (response.ok) {
			alert("Solicitud de amistad cancelada.");
		} else {
			const errorMessage = await response.json();
			alert("Error al cancelar la solicitud: " + errorMessage.error);
		}
	} catch (error) {
		alert("Error al cancelar la solicitud: " + error);
	}
}

export async function deleteFriend(userId: string) {
	try {
		const response = await fetch(`https://localhost:8443/back/delete_friend`, {
			method: "POST",
			credentials: 'include',
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ friendId: userId }),
		});
		if (response.ok) {
			alert("Friend deleted");
		} else {
			const errorMessage = await response.json();
			alert("Error al cancelar la solicitud: " + errorMessage.error);
		}
	} catch (error) {
		alert("Error al cancelar la solicitud: " + error);
	}
}

export async function blockUser(userId: string) {
	try {
		const response = await fetch(`https://localhost:8443/back/block_user`, {
			method: "POST",
			credentials: 'include',
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ friendId: userId }),
		});
		if (response.ok) {
			alert("Friend deleted");
		} else {
			const errorMessage = await response.json();
			alert("Error al cancelar la solicitud: " + errorMessage.error);
		}
	} catch (error) {
		alert("Error al cancelar la solicitud: " + error);
	}
}

export async function unblockUser(userId: string) {
	try {
		const response = await fetch(`https://localhost:8443/back/unblock_user`, {
			method: "POST",
			credentials: 'include',
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ friendId: userId }),
		});
		if (response.ok) {
			alert("User unblocked");
		} else {
			const errorMessage = await response.json();
			alert("Error al cancelar la solicitud: " + errorMessage.error);
		}
	} catch (error) {
		alert("Error al cancelar la solicitud: " + error);
	}
}

export function openPrivateChat(username: string) {
	let privateChat = document.getElementById("private-chat");
	if (privateChat) {
		privateChat.remove();
	}
	console.log("Abriendo chat privado con:", username);
}