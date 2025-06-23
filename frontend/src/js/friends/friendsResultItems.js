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
import { BcUnblockItem } from './BcUnblockItem.js';
import { BcAcceptDeclineRequest } from './BcAcceptDeclineRequest.js';
import { BcRemoveBlockItem } from './BcRemoveBlockItem.js';
//
/**
* | enum (db) 	 	; mi estatus en front 	; 	signficado 			; 	opciones que mostraríamos en Front
* |		  		; 			0			;	no somos amigos 	; 		addfriend
* |	accepted 	;			1 			; 	Somos amigos 		; 		removefriend | block
* |	pending P	;			2 			; 	solicitud enviada 	;		cancel request
* |	pending A 	;			3 			; 	solicitud recibida 	; 		accept request | decline request
* |	blocked P	;			4 			; 	yo lo he bloqueado 	; 		unblock
* |	blocked A	;			5 			; 	Me ha bloqueado 	; 		Cagarme en sus 💀
*/
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
                else if (this.userStatus == 1) {
                    component = new BcRemoveBlockItem();
                }
                else if (this.userStatus == 2) {
                    component = new BcCancelFriendRequest();
                }
                else if (this.userStatus == 3) {
                    component = new BcAcceptDeclineRequest();
                }
                else if (this.userStatus == 4) {
                    component = new BcUnblockItem();
                }
                if (component) {
                    component.render(this.container, placeholders);
                }
                else {
                    console.error("Component is undefined for userStatus:", this.userStatus);
                }
                console.log("Justo despues de renderizar el componente en SearchResultItem");
            }
            catch (error) {
                console.error("Error loading HTML file:", error);
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
            let appElement = this.container;
            while (!appElement) {
                yield new Promise(resolve => setTimeout(resolve, 100)); // Esperar 100ms antes de volver a comprobar
                appElement = this.container;
            }
            this.initChild(appElement);
        });
    }
}
