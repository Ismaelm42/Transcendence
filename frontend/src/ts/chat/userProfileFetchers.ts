export async function sendFriendRequest(userId: string): Promise<void> {
	try {
		const requestBody = { friendId: userId };
		const response = await fetch("https://localhost:8443/back/send_friend_request", {
			method: "POST",
			credentials: 'include',
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(requestBody),
		});
		if (response.ok) {
			const data = await response.json();
		}
		else {
			const errorMessage = await response.json();
		}
	} catch (error) {
	}
}

export async function acceptFriendRequest(userId: string): Promise<void> {
	try {
		const response = await fetch("https://localhost:8443/back/accept_friend_request", {
			method: "POST",
			credentials: 'include',
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ friendId: userId }),
		});
		if (response.ok) {
			const data = await response.json();
		} else {
			const errorMessage = await response.json();
		}
	} catch (error) {
	}
}



export async function fetchUserData(userId: string) {
	try {
		const response = await fetch(`https://localhost:8443/back/get_user_by_id/?id=${userId}`, {
			method: "GET",
			credentials: 'include',
			headers: {
				"Content-Type": "application/json",
			},
		});
		if (response.ok) {
			return await response.json();
		} else {
			throw new Error("Error fetching user data");
		}
	} catch (error) {
		return null;
	}
}

export async function fetchUserStats(userId: string) {
	try {
		const response = await fetch(`https://localhost:8443/back/get_user_gamelogs/${userId}`, {
			method: "GET",
			credentials: 'include',
			headers: {
				"Content-Type": "application/json",
			},
		});
		if (response.ok) {
			return await response.json();
		} else {
			throw new Error("Error fetching user stats");
		}
	} catch (error) {
		return null;
	}
}

export async function fetchFriendEntries(userId: string) {
	try {
		const response = await fetch(`https://localhost:8443/back/get_all_friends_entries_from_an_id`, {
			method: "POST",
			credentials: 'include',
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ userId }),
		});
		if (response.ok) {
			return await response.json();
		} else {
			throw new Error("Error fetching friend entries");
		}
	} catch (error) {
		return null;
	}
}
