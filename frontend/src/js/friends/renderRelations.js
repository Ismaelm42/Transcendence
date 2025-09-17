var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { acceptFriendRequest } from "../chat/userProfileFetchers.js";
import { rejectFriendRequest, deleteFriend, unblockUser, blockUser } from "../chat/userProfileActions.js";
export function renderRelations(relationsContainer, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Rendering relations for user ID:", userId, "Storage userConnected:", sessionStorage.getItem("userConnected"));
        try {
            if (!relationsContainer) {
                console.error("El contenedor de relaciones no existe en el DOM");
                return;
            }
            const relations = yield getRelationsForUserId(userId);
            //console.log("Relations:", relations);
            if (!relations || relations.length === 0) {
                relationsContainer.innerHTML = `
				<div id="pong-container" class="flex flex-col items-center justify-center py-8 text-gray-500">
					<svg width="80" height="80" viewBox="0 0 24 24" fill="none">
						<circle cx="12" cy="12" r="10" stroke="#888" stroke-width="2" fill="#f3f4f6"/>
						<circle cx="9" cy="10" r="1" fill="#888"/>
						<circle cx="15" cy="10" r="1" fill="#888"/>
						<path d="M9 16c1.333-1 4-1 6 0" stroke="#888" stroke-width="1.5" stroke-linecap="round"/>
					</svg>
					<div class="mt-2 text-gray-700  font-bold text-2xl">No relations yet</div>
				</div>
			`;
                return;
            }
            const friendsContainer = document.getElementById("friends-container");
            const pendingContainer = document.getElementById("pending-container");
            const blockedContainer = document.getElementById("blocked-container");
            if (!friendsContainer || !pendingContainer || !blockedContainer) {
                console.error("Uno o más contenedores no existen en el DOM");
                return;
            }
            friendsContainer.innerHTML = "";
            pendingContainer.innerHTML = "";
            blockedContainer.innerHTML = "";
            const friends = relations.filter(relation => relation.status === "accepted");
            const pending = relations.filter(relation => relation.status === "pending");
            const blocked = relations.filter(relation => relation.status === "blocked" && relation.friendId !== userId);
            yield renderUserList(friends, friendsContainer, relationsContainer, userId);
            yield renderUserList(pending, pendingContainer, relationsContainer, userId);
            yield renderUserList(blocked, blockedContainer, relationsContainer, userId);
            relationsContainer.onclick = null; // Limpiar cualquier listener previo
            // Lógica de botones (delegación de eventos)
            relationsContainer.onclick = (event) => __awaiter(this, void 0, void 0, function* () {
                const target = event.target;
                const button = target.closest("button");
                if (!button)
                    return;
                const userItem = button.closest(".user-item");
                const otherUserId = userItem === null || userItem === void 0 ? void 0 : userItem.getAttribute("data-user-id");
                if (!otherUserId)
                    return;
                if (button.classList.contains("btnAcceptRequest")) {
                    console.log("Accepting friend request for user ID:", otherUserId);
                    yield acceptFriendRequest(otherUserId);
                }
                else if (button.classList.contains("btnCancelFriendRequest")) {
                    yield rejectFriendRequest(otherUserId);
                }
                else if (button.classList.contains("btnDeclineRequest")) {
                    yield rejectFriendRequest(otherUserId);
                }
                else if (button.classList.contains("btnRemoveFriend")) {
                    yield deleteFriend(otherUserId);
                }
                else if (button.classList.contains("btnUnblockItem")) {
                    yield unblockUser(otherUserId);
                }
                else if (button.classList.contains("btnBlockItem")) {
                    yield blockUser(otherUserId);
                }
                // Recargar relaciones tras la acción
                //await renderRelations(relationsContainer, userId);
            });
        }
        catch (error) {
            console.error("Error retrieving relations:", error);
            relationsContainer.innerHTML = `<div id="pong-container">An error occurred while generating the content</div>`;
            return;
        }
    });
}
function getRelationsForUserId(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`./back/get_all_friends_entries_from_an_id`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ userId })
            });
            if (!response.ok) {
                throw new Error("Failed to fetch relations");
            }
            const data = yield response.json();
            return data;
        }
        catch (error) {
            console.error("Error fetching relations:", error);
            return [];
        }
    });
}
function getUserById(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`./back/get_user_by_id/?id=${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) {
                throw new Error("Failed to fetch user");
            }
            const user = yield response.json();
            return user;
        }
        catch (error) {
            console.error("Error fetching user:", error);
            return { id: userId, username: "Unknown", avatarPath: "/img/default-avatar.png" }; // Default values
        }
    });
}
function renderUserList(relations, container, relationsContainer, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const relation of relations) {
            const otherId = relation.userId == userId ? relation.friendId : relation.userId;
            // Evita duplicados: elimina cualquier nodo existente para ese userId antes de crear uno nuevo
            const existing = container.querySelector(`.user-item[data-user-id="${otherId}"]`);
            if (existing) {
                existing.remove();
            }
            const user = yield getUserById(otherId);
            const userTemplate = yield fetch("../../html/friends/userTemplate.html");
            const userElement = document.createElement("div");
            const buttonsHtml = getButtonConfig(relation.status, relation, userId);
            const userColorStatus = getColorStatus(user.id); //El color no furula
            userElement.className = "user-item";
            userElement.setAttribute("data-user-id", user.id);
            userElement.innerHTML += (yield userTemplate.text())
                .replace(/{{ userId }}/g, user.id)
                .replace(/{{ username }}/g, user.username)
                .replace(/{{ imagePath }}/g, user.avatarPath || "/img/default-avatar.png")
                .replace(/{{ bgcolor }}/g, userColorStatus)
                .replace(/{{ bcolor }}/g, "red")
                .replace(/{{ buttons }}/g, buttonsHtml);
            //.replace("{{ status }}", relation.status || "unknown")
            //.replace("{{ relationId }}", relation.id || "unknown");
            container.appendChild(userElement);
        }
    });
}
function getButtonConfig(status, relation, userId) {
    switch (status) {
        case "accepted":
            return `
					<button type="button" class="btnRemoveFriend p-1.5 ms-2 text-sm font-medium text-white bg-red-700 rounded-lg border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 bg-red-600 hover:bg-red-700 focus:ring-red-800" title="Remove friend">
						<svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24">
							<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M15,4A4,4 0 0,0 11,8A4,4 0 0,0 15,12A4,4 0 0,0 19,8A4,4 0 0,0 15,4M15,5.9C16.16,5.9 17.1,6.84 17.1,8C17.1,9.16 16.16,10.1 15,10.1A2.1,2.1 0 0,1 12.9,8A2.1,2.1 0 0,1 15,5.9M1,10V12H9V10H1M15,13C12.33,13 7,14.33 7,17V20H23V17C23,14.33 17.67,13 15,13M15,14.9C17.97,14.9 21.1,16.36 21.1,17V18.1H8.9V17C8.9,16.36 12,14.9 15,14.9Z" />
						</svg>
					</button>
					<button type="button" class="btnBlockItem p-1.5 ms-2 text-sm font-medium text-white bg-indigo-700 rounded-lg border border-indigo-700 hover:bg-indigo-800 focus:ring-4 focus:outline-none focus:ring-indigo-300 bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-800" title="Block user">
						<svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24">
							<path Stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M6 20V10H18V13.09C18.33 13.04 18.66 13 19 13C19.34 13 19.67 13.04 20 13.09V10C20 8.9 19.11 8 18 8H17V6C17 3.24 14.76 1 12 1S7 3.24 7 6V8H6C4.89 8 4 8.89 4 10V20C4 21.1 4.89 22 6 22H13.81C13.46 21.39 13.22 20.72 13.09 20H6M9 6C9 4.34 10.34 3 12 3S15 4.34 15 6V8H9V6M14 15C14 16.11 13.11 17 12 17C10.89 17 10 16.1 10 15C10 13.89 10.89 13 12 13C13.11 13 14 13.9 14 15M23 18V20H20V23H18V20H15V18H18V15H20V18H23Z" />
						</svg>
					</button>
				`;
        case "pending":
            if (relation.userId == userId) {
                // Yo envié la solicitud
                return `
					<button type="button" class="btnCancelFriendRequest p-1.5 ms-2 text-sm font-medium text-white bg-yellow-700 rounded-lg border border-yellow-700 hover:bg-yellow-800 focus:ring-4 focus:outline-none focus:ring-yellow-300 bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-800" title="Cancel request">
						<svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24">
							<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M2.75,7L4.03,5.75L13.26,15L20,21.72L18.73,23L15.73,20H4V17C4,15.14 6.61,13.92 9.09,13.36L2.75,7M20,17V19.18L18.1,17.28V17C18.1,16.74 17.6,16.35 16.8,16L14,13.18C16.71,13.63 20,14.91 20,17M5.9,17V18.1H13.83L10.72,15C8.19,15.3 5.9,16.45 5.9,17M12,4A4,4 0 0,1 16,8C16,9.95 14.6,11.58 12.75,11.93L8.07,7.25C8.42,5.4 10.05,4 12,4M12,6A2,2 0 0,0 10,8A2,2 0 0,0 12,10A2,2 0 0,0 14,8A2,2 0 0,0 12,6Z" />
						</svg>
					</button>
				`;
            }
            else {
                // Yo recibí la solicitud
                return `
					<button type="button" class="btnAcceptRequest p-1.5 ms-2 text-sm font-medium text-white bg-green-700 rounded-lg border border-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 bg-green-600 hover:bg-green-700 focus:ring-green-800" title="Accept request">
						<svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24">
							<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M21.1,12.5L22.5,13.91L15.97,20.5L12.5,17L13.9,15.59L15.97,17.67L21.1,12.5M11,4A4,4 0 0,1 15,8A4,4 0 0,1 11,12A4,4 0 0,1 7,8A4,4 0 0,1 11,4M11,6A2,2 0 0,0 9,8A2,2 0 0,0 11,10A2,2 0 0,0 13,8A2,2 0 0,0 11,6M11,13C11.68,13 12.5,13.09 13.41,13.26L11.74,14.93L11,14.9C8.03,14.9 4.9,16.36 4.9,17V18.1H11.1L13,20H3V17C3,14.34 8.33,13 11,13Z" />
						</svg>
					</button>
					<button type="button" class="btnDeclineRequest p-1.5 ms-2 text-sm font-medium text-white bg-red-700 rounded-lg border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 bg-red-600 hover:bg-red-700 focus:ring-red-800" title="Decline request">
						<svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24">
							<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M1.46,8.88L2.88,7.46L5,9.59L7.12,7.46L8.54,8.88L6.41,11L8.54,13.12L7.12,14.54L5,12.41L2.88,14.54L1.46,13.12L3.59,11L1.46,8.88M15,4A4,4 0 0,1 19,8A4,4 0 0,1 15,12A4,4 0 0,1 11,8A4,4 0 0,1 15,4M15,5.9A2.1,2.1 0 0,0 12.9,8A2.1,2.1 0 0,0 15,10.1C16.16,10.1 17.1,9.16 17.1,8C17.1,6.84 16.16,5.9 15,5.9M15,13C17.67,13 23,14.33 23,17V20H7V17C7,14.33 12.33,13 15,13M15,14.9C12,14.9 8.9,16.36 8.9,17V18.1H21.1V17C21.1,16.36 17.97,14.9 15,14.9Z" />
						</svg>
					</button>
				`;
            }
        case "blocked":
            return `
					<button type="button" class="btnUnblockItem p-1.5 ms-2 text-sm font-medium text-white bg-lime-700 rounded-lg border border-lime-700 hover:bg-lime-800 focus:ring-4 focus:outline-none focus:ring-lime-300 bg-lime-600 hover:bg-lime-700 focus:ring-lime-800" title="Unblock user">
						<svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24">
							<path Stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M14 15C14 16.11 13.11 17 12 17S10 16.11 10 15 10.9 13 12 13 14 13.9 14 15M6 20V10H18V13.09C18.33 13.04 18.66 13 19 13C19.34 13 19.67 13.04 20 13.09V10C20 8.9 19.11 8 18 8H17V6C17 3.24 14.76 1 12 1S7 3.24 7 6H9C9 4.34 10.34 3 12 3S15 4.34 15 6V8H6C4.89 8 4 8.9 4 10V20C4 21.1 4.89 22 6 22H13.81C13.46 21.39 13.22 20.72 13.09 20H6M21.34 15.84L17.75 19.43L16.16 17.84L15 19L17.75 22L22.5 17.25L21.34 15.84Z" />
						</svg>
					</button>
				`;
        default:
            return ""; // Sin botones otros estados
    }
}
function getColorStatus(userId) {
    console.log("Retrieving color status for user ID:", userId);
    const UserConnected = sessionStorage.getItem("userConnected");
    let colorStatus = "offline"; // Valor por defecto 
    for (const user of JSON.parse(UserConnected || "[]")) {
        console.log("Checking user:", user.userId, "against", userId);
        if (user.userId == userId) {
            colorStatus = user.status;
            console.log("User status found:", colorStatus);
            break;
        }
    }
    switch (colorStatus) {
        case "green":
            return "bg-green-500";
        case "yellow":
            return "bg-yellow-500";
        default:
            return "bg-red-500";
    }
}
