var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function sendFriendRequest(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const requestBody = { friendId: userId };
            const response = yield fetch("https://localhost:8443/back/send_friend_request", {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });
            if (response.ok) {
                const data = yield response.json();
                console.log("Friend request sent successfully:", data);
            }
            else {
                const errorMessage = yield response.json();
                console.error("Error sending friend request:", errorMessage);
            }
        }
        catch (error) {
            console.error("Error sending friend request:", error);
        }
    });
}
export function fetchUserData(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`https://localhost:8443/back/get_user_by_id/?id=${userId}`, {
                method: "GET",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.ok) {
                return yield response.json();
            }
            else {
                throw new Error("Error fetching user data");
            }
        }
        catch (error) {
            console.error("Error fetching user data:", error);
            return null;
        }
    });
}
export function fetchUserStats(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`https://localhost:8443/back/get_user_gamelogs/${userId}`, {
                method: "GET",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.ok) {
                return yield response.json();
            }
            else {
                throw new Error("Error fetching user stats");
            }
        }
        catch (error) {
            console.error("Error fetching user stats:", error);
            return null;
        }
    });
}
export function fetchFriendEntries(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`https://localhost:8443/back/get_all_friends_entries_from_an_id`, {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId }),
            });
            if (response.ok) {
                return yield response.json();
            }
            else {
                throw new Error("Error fetching friend entries");
            }
        }
        catch (error) {
            console.error("Error fetching friend entries:", error);
            return null;
        }
    });
}
