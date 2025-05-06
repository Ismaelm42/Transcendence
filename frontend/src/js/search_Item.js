/**
 * UserStatus
 * 0 - No friends
 * 1 - Friends
 * 2 - Pending
 * 3 - Request sent
 * 4 - Request received
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class SearchItem {
    constructor(containerId, user, userStatus) {
        this.user = null; // Almacena el id y nombre de usuario autenticado
        this.container = document.getElementById(containerId);
        this.user = user;
        this.userStatus = 0; // Inicializa el estado de usuarios
        this.init();
    }
    checkAuth() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Verificando autenticación en checkAuth()...");
            const validation = false; // si está en false se está verificando la autenticación
            // Simulación de verificación de autenticación PARA CUANDO LA COOKIE NO SE ENVIA BIEN"
            if (validation) {
                const user = {
                    "username": "Pepe5@gmail.com",
                    "password": "1234",
                    "email": "Pepe5@gmail.com"
                };
                return user.username;
            }
            else {
                // console.log("Verificando autenticación...");
                try {
                    const response = yield fetch("https://localhost:8443/back/auth/verify-token", {
                        method: "GET",
                        credentials: "include"
                    });
                    if (!response.ok)
                        return null;
                    const data = yield response.json();
                    return data.user.username; // Devuelve el nombre de usuario si está autenticado
                }
                catch (error) {
                    console.error("Error al verificar la autenticación:", error);
                    return null;
                }
            }
        });
    }
    render(appElement) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch("../html/searchItem.html");
                if (!response.ok)
                    throw new Error("Failed to load the HTML file");
                let htmlContent = yield response.text();
                htmlContent = htmlContent;
                if (this.userStatus == 0) {
                    htmlContent = htmlContent.replace("{{ search_item_btn }}", `<button id="addFriendButton" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Add Friend</button>`);
                }
                else if (this.userStatus == 1) {
                    htmlContent = htmlContent.replace("{{ search_item_btn }}", `<button id="removeFriendButton" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Remove Friend</button>`);
                }
                else if (this.userStatus == 2) {
                    htmlContent = htmlContent.replace("{{ search_item_btn }}", `<button id="cancelRequestButton" class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">Cancel Request</button>`);
                }
                else if (this.userStatus == 3) {
                    htmlContent = htmlContent.replace("{{ search_item_btn }}", `<button id="acceptRequestButton" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Accept Request</button>`);
                }
                else if (this.userStatus == 4) {
                    htmlContent = htmlContent.replace("{{ search_item_btn }}", `<button id="declineRequestButton" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Decline Request</button>`);
                }
                else {
                    htmlContent = htmlContent.replace("{{ search_item_btn }}", `<button id="addFriendButton" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Add Friend</button>`);
                }
                if (this.user && this.user[0])
                    htmlContent = htmlContent.replace("{{ id }}", this.user[0]);
                if (this.user && this.user[1])
                    htmlContent = htmlContent.replace("{{ username }}", this.user[1]);
                appElement.innerHTML += htmlContent;
            }
            catch (error) {
                console.error("Error al renderizar el elemento SearchItem:", error);
                appElement.innerHTML = '<div>Error retrieving user</div>';
            }
        });
    }
    /**
         *
         * @param appElement html al que se añadirá el componente
         *
         */
    initChild(appElement) {
        return __awaiter(this, void 0, void 0, function* () {
            if (appElement) {
                yield this.render(appElement);
            }
        });
    }
    /**
     * Método para inicializar el paso se asegura que existen los elementos header, menu y app
     * para poder renderizar el contenido correspondiente en cada slot o "placeholder"
     */
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            let appElement = document.getElementById('search.items-container');
            while (!appElement) {
                yield new Promise(resolve => setTimeout(resolve, 100)); // Esperar 100ms antes de volver a comprobar
                appElement = document.getElementById('app-container');
            }
            this.initChild(appElement);
        });
    }
}
