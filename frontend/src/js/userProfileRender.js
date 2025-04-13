var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Step } from './stepRender.js';
import { handleProfile } from './handleProfile.js';
export default class Profile extends Step {
    render(appElement) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("En Profile render");
            try {
                if (!this.username) {
                    this.username = yield this.checkAuth();
                }
                console.log("Valor de user en render:", this.username);
                const usernameencode = this.username ? encodeURIComponent(this.username) : '';
                // const user = this.username;
                const url = `https://localhost:8443/back/get_user_by_username/?username=${this.username}`;
                const getUserResponse = yield fetch(`${url}`, {
                    method: "GET",
                    credentials: "include"
                });
                if (!getUserResponse.ok) {
                    throw new Error("Error al obtener el usuario");
                }
                const userData = yield getUserResponse.json();
                // console.log("userData:", userData);
                // if (userData) {
                // 	console.log( 'username: ',userData.username);
                // 	console.log( 'email: ' , userData.email);
                // 	console.log( 'pass: ', userData.password);
                // 	console.log( 'avatar:' ,userData.avatarPath);
                // 	console.log( 'pass: ', userData.password);
                // 	console.log( 'last Login: ',userData.lastLogin);
                // }
                // console.log("Valor de user en getUserResponse:", getUserResponse);
                const response = yield fetch("../html/profile.html");
                if (!response.ok)
                    throw new Error("Failed to load the HTML file");
                let htmlContent = yield response.text();
                htmlContent = htmlContent.replace("{{ username }}", userData.username); // Ejemplo de reemplazo simple
                htmlContent = htmlContent.replace("{{ email }}", userData.email);
                htmlContent = htmlContent.replace("{{ avatarPath }}", userData.avatarPath);
                userData.tournamentUserName ? htmlContent = htmlContent.replace("{{ tournamentusername }}", userData.tournamentUserName)
                    : htmlContent = htmlContent.replace("{{ tournamentusername }}", userData.username);
                appElement.innerHTML = htmlContent;
                handleProfile();
                // }
            }
            catch (error) {
                console.error("Error al renderizar la página de login:", error);
                appElement.innerHTML = `<div id="pong-container">Ocurrió un error al generar el contenido</div>`;
            }
        });
    }
}
