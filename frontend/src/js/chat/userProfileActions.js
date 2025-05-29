var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function checkFriendStatus(userId, friendsEntries) {
    return __awaiter(this, void 0, void 0, function* () {
        const blockedFriends = friendsEntries.filter((entry) => entry.status === "blocked");
        const isBlocked = blockedFriends.some((entry) => String(entry.friendId) === String(userId) || String(entry.userId) === String(userId));
        // Filtra solo los amigos aceptados
        const acceptedFriends = friendsEntries.filter((entry) => entry.status === "accepted");
        const pendingFriends = friendsEntries.filter((entry) => entry.status === "pending");
        // Comprueba si el userId mostrado es amigo
        const isFriend = acceptedFriends.some((entry) => String(entry.friendId) === String(userId) || String(entry.userId) === String(userId));
        const isPending = pendingFriends.some((entry) => String(entry.friendId) === String(userId) || String(entry.userId) === String(userId));
        return { isFriend, isPending, isBlocked };
    });
}
export function rejectFriendRequest(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch("https://localhost:8443/back/reject_friend_request", {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ friendId: userId }),
            });
            if (response.ok) {
                alert("Solicitud de amistad cancelada.");
            }
            else {
                const errorMessage = yield response.json();
                alert("Error al cancelar la solicitud: " + errorMessage.error);
            }
        }
        catch (error) {
            alert("Error al cancelar la solicitud: " + error);
        }
    });
}
export function deleteFriend(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`https://localhost:8443/back/delete_friend`, {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ friendId: userId }),
            });
            if (response.ok) {
                alert("Friend deleted");
            }
            else {
                const errorMessage = yield response.json();
                alert("Error al cancelar la solicitud: " + errorMessage.error);
            }
        }
        catch (error) {
            alert("Error al cancelar la solicitud: " + error);
        }
    });
}
export function blockUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`https://localhost:8443/back/block_user`, {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ friendId: userId }),
            });
            if (response.ok) {
                alert("Friend deleted");
            }
            else {
                const errorMessage = yield response.json();
                alert("Error al cancelar la solicitud: " + errorMessage.error);
            }
        }
        catch (error) {
            alert("Error al cancelar la solicitud: " + error);
        }
    });
}
export function unblockUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`https://localhost:8443/back/unblock_user`, {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ friendId: userId }),
            });
            if (response.ok) {
                alert("User unblocked");
            }
            else {
                const errorMessage = yield response.json();
                alert("Error al cancelar la solicitud: " + errorMessage.error);
            }
        }
        catch (error) {
            alert("Error al cancelar la solicitud: " + error);
        }
    });
}
export function openPrivateChat(username) {
    let privateChat = document.getElementById("private-chat");
    if (privateChat) {
        privateChat.remove();
    }
    console.log("Abriendo chat privado con:", username);
}
