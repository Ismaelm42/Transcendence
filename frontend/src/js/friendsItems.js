var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BcAddFriend } from './BcAddFriend.js';
import { BcCancelFriendRequest } from './BcCancelFriendRequest.js';
// import { BcRemoveFriend } from './BcRemoveFriend.js';
// import { BcAcceptFriendRequest } from './BcAcceptFriendRequest.js';
// import { BcDeclineFriendRequest } from './BcDeclineFriendRequest.js';
// import { showMessage } from './showMessage.js';
// import { BcBlockUser } from './BcBlockUser.js';
// import { BcUnblockUser } from './BcUnblockUser.js';
/* | 	enum 	 	; mi estatus en front 	; 	signficado 			; 	opciones que mostraríamos en Front
* |		  		; 			0			;	no somos amigos 	; 		addfriend
* |	accepted 	;			1 			; 	Somos amigos 		; 		removefriend | block
* |	pending P	;			2 			; 	solicitud enviada 	;		cancel request
* |	pending A 	;			3 			; 	solicitud recibida 	; 		accept request | decline request
* |	blocked P	;			4 			; 	yo lo he bloqueado 	; 		unblock
* |	blocked A	;			5 			; 	Me ha bloqueado 	; 		Cagarme en sus 💀
*/
/**
 * Friends list action buttons
 * 1 - Friends - removefriend
 * 2 - Block - unblock
 */
// TypeScript does not support macros like C, but you can use constants or functions to achieve similar behavior.
// const SVG_ICONS = {
// 	addFriend: `<button type="submit" class=" btnAddfriend p-1.5 ms-2 text-sm font-medium text-white bg-green-700 rounded-lg border border-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800" title="Add friend">
// 					<svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24">
// 						<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M15,4A4,4 0 0,0 11,8A4,4 0 0,0 15,12A4,4 0 0,0 19,8A4,4 0 0,0 15,4M15,5.9C16.16,5.9 17.1,6.84 17.1,8C17.1,9.16 16.16,10.1 15,10.1A2.1,2.1 0 0,1 12.9,8A2.1,2.1 0 0,1 15,5.9M4,7V10H1V12H4V15H6V12H9V10H6V7H4M15,13C12.33,13 7,14.33 7,17V20H23V17C23,14.33 17.67,13 15,13M15,14.9C17.97,14.9 21.1,16.36 21.1,17V18.1H8.9V17C8.9,16.36 12,14.9 15,14.9Z" />
// 					</svg>	
// 				</button>`,
// 	removeFriend: `<button type="submit" class="btnRemoveFriend p-1.5 ms-2 text-sm font-medium text-white bg-red-700 rounded-lg border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800" title="Remove friend">
// 					<svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24">
// 						<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M15,4A4,4 0 0,0 11,8A4,4 0 0,0 15,12A4,4 0 0,0 19,8A4,4 0 0,0 15,4M15,5.9C16.16,5.9 17.1,6.84 17.1,8C17.1,9.16 16.16,10.1 15,10.1A2.1,2.1 0 0,1 12.9,8A2.1,2.1 0 0,1 15,5.9M1,10V12H9V10H1M15,13C12.33,13 7,14.33 7,17V20H23V17C23,14.33 17.67,13 15,13M15,14.9C17.97,14.9 21.1,16.36 21.1,17V18.1H8.9V17C8.9,16.36 12,14.9 15,14.9Z" />
// 					</svg>
// 				</button>`,
// 	cancelRequest: `<button type="submit" class="btnCancelRequest p-1.5 ms-2 text-sm font-medium text-white bg-yellow-700 rounded-lg border border-yellow-700 hover:bg-yellow-800 focus:ring-4 focus:outline-none focus:ring-yellow-300 dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800" title="Cancel request">
// 					<svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24">
// 						<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M2.75,7L4.03,5.75L13.26,15L20,21.72L18.73,23L15.73,20H4V17C4,15.14 6.61,13.92 9.09,13.36L2.75,7M20,17V19.18L18.1,17.28V17C18.1,16.74 17.6,16.35 16.8,16L14,13.18C16.71,13.63 20,14.91 20,17M5.9,17V18.1H13.83L10.72,15C8.19,15.3 5.9,16.45 5.9,17M12,4A4,4 0 0,1 16,8C16,9.95 14.6,11.58 12.75,11.93L8.07,7.25C8.42,5.4 10.05,4 12,4M12,6A2,2 0 0,0 10,8A2,2 0 0,0 12,10A2,2 0 0,0 14,8A2,2 0 0,0 12,6Z" />
// 					</svg>
// 				</button>`,
// 	acceptRequest: `<button type="submit" class="btnAcceptRequest p-1.5 ms-2 text-sm font-medium text-white bg-green-700 rounded-lg border border-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800" title="Accept request">
// 					<svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24">
// 						<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M21.1,12.5L22.5,13.91L15.97,20.5L12.5,17L13.9,15.59L15.97,17.67L21.1,12.5M11,4A4,4 0 0,1 15,8A4,4 0 0,1 11,12A4,4 0 0,1 7,8A4,4 0 0,1 11,4M11,6A2,2 0 0,0 9,8A2,2 0 0,0 11,10A2,2 0 0,0 13,8A2,2 0 0,0 11,6M11,13C11.68,13 12.5,13.09 13.41,13.26L11.74,14.93L11,14.9C8.03,14.9 4.9,16.36 4.9,17V18.1H11.1L13,20H3V17C3,14.34 8.33,13 11,13Z" />
// 					</svg>
// 				</button>`,
// 	declineRequest: `<button type="submit" class="btnDeclineRequest p-1.5 ms-2 text-sm font-medium text-white bg-orange-700 rounded-lg border border-orange-700 hover:bg-orange-800 focus:ring-4 focus:outline-none focus:ring-orange-300 dark:bg-orange-600 dark:hover:bg-orange-700 dark:focus:ring-orange-800" title="Decline request">
// 					<svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24">
// 						<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M1.46,8.88L2.88,7.46L5,9.59L7.12,7.46L8.54,8.88L6.41,11L8.54,13.12L7.12,14.54L5,12.41L2.88,14.54L1.46,13.12L3.59,11L1.46,8.88M15,4A4,4 0 0,1 19,8A4,4 0 0,1 15,12A4,4 0 0,1 11,8A4,4 0 0,1 15,4M15,5.9A2.1,2.1 0 0,0 12.9,8A2.1,2.1 0 0,0 15,10.1C16.16,10.1 17.1,9.16 17.1,8C17.1,6.84 16.16,5.9 15,5.9M15,13C17.67,13 23,14.33 23,17V20H7V17C7,14.33 12.33,13 15,13M15,14.9C12,14.9 8.9,16.36 8.9,17V18.1H21.1V17C21.1,16.36 17.97,14.9 15,14.9Z" />
// 					</svg>
// 				</button>`
// };
// Example usage for replacing with addFriend
export class SearchResultItem {
    constructor(containerId, user, userStatus) {
        this.user = null; // Almacena el id y nombre de usuario autenticado
        this.container = document.getElementById(containerId);
        this.user = user;
        this.userStatus = userStatus; // Inicializa el estado de usuarios
        this.init();
        console.log("userStatus en SearchResultItem:", this.userStatus);
    }
    render(appElement) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("En SearchResultItem render");
            console.log("userStatus:", this.userStatus);
            console.log("user:", this.user);
            console.log("containerId:", this.container.id);
            const placeholders = {
                "id": this.user ? this.user[0] : "",
                "username": this.user ? this.user[1] : "",
            };
            try {
                let component;
                if (this.userStatus == 0) {
                    component = new BcAddFriend();
                }
                else if (this.userStatus == 2) {
                    component = new BcCancelFriendRequest();
                }
                if (component) {
                    component.render(this.container, placeholders);
                }
                else {
                    console.error("Component is undefined for userStatus:", this.userStatus);
                }
                // try{
                // 	if (this.userStatus == 0) {
                // 			const component = new BcAddFriend();
                // 		}else if (this.userStatus == 1) {
                // 			const component = new BcRemoveFriend();
                // 		} else if (this.userStatus == 2) {
                // 			const component = new BcCancelFriendRequest();
                // 		} else if (this.userStatus == 3) {
                // 			const component = new BcAcceptFriendRequest();
                // 		} else if (this.userStatus == 4) {
                // 			const component = new BcDeclineFriendRequest();
                // 		}
                // 	component.render(this.container!, placeholders);
                // }
            }
            catch (error) {
                console.error("Error loading HTML file:", error);
            }
        });
    }
    // try {
    // 	const response = await fetch("../html/search_item.html");
    // 	if (!response.ok) throw new Error("Failed to load the HTML file");
    // 	let htmlContent = await response.text();
    // 	htmlContent = htmlContent
    // 	console.log("userStatus:", this.userStatus);
    // 	if (this.userStatus == 0) {
    // 		htmlContent = htmlContent.replace("{{ search_item_btn }}", `${SVG_ICONS.addFriend}`);
    // 		htmlContent = htmlContent.replace("{{ label }}", `Add friend`);	
    // 		// htmlContent = htmlContent.replace("{{ search_item_btn }}", `<button id="addFriendButton" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Add Friend</button>`);
    // 	} else if (this.userStatus == 1) {
    // 		htmlContent = htmlContent.replace("{{ search_item_btn }}", `${SVG_ICONS.removeFriend}`);
    // 		htmlContent = htmlContent.replace("{{ label }}", `Remove friend`);	
    // 	} else if (this.userStatus == 2) {
    // 		htmlContent = htmlContent.replace("{{ search_item_btn }}", `${SVG_ICONS.cancelRequest}`);
    // 		htmlContent = htmlContent.replace("{{ label }}", `Cancel request`);
    // 	} else if (this.userStatus == 3) {
    // 		htmlContent = htmlContent.replace("{{ search_item_btn }}", `${SVG_ICONS.acceptRequest}`);
    // 		htmlContent = htmlContent.replace("{{ label }}", `Accept request`);
    // 	} else if (this.userStatus == 4) {
    // 		htmlContent = htmlContent.replace("{{ search_item_btn }}", `${SVG_ICONS.declineRequest}`);
    // 		htmlContent = htmlContent.replace("{{ label }}", `Decline request`);
    // 	}
    // 	if (this.user && this.user[0])
    // 		htmlContent = htmlContent.replace("{{ id }}", this.user[0]);
    // 	if (this.user && this.user[1])
    // 		htmlContent = htmlContent.replace("{{ username }}", this.user[1]);
    // 	console.log("htmlcontent: " + htmlContent);
    // 	this.container.innerHTML += htmlContent;
    // }catch (error) {
    // 	console.error("Error al renderizar el elemento SearchResultItem:", error);
    // 	this.container.innerHTML= '<div>Error retrieving user</div>';
    // }
    // }
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
            let appElement = this.container;
            while (!appElement) {
                yield new Promise(resolve => setTimeout(resolve, 100)); // Esperar 100ms antes de volver a comprobar
                appElement = this.container;
            }
            this.initChild(appElement);
        });
    }
}
