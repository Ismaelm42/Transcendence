var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Step } from '../spa/stepRender.js';
import { handleSocketEvents } from './handleSocketEvents.js';
import { setAppContainer, setUserId, setSocket } from './state.js';
import { checkIfGameIsRunning, launchGame, launchUI } from './launchGame.js';
export default class Chess extends Step {
    render(appElement) {
        return __awaiter(this, void 0, void 0, function* () {
            sessionStorage.setItem("current-view", "Chess");
            if (!this.username) {
                this.username = yield this.checkAuth();
            }
            try {
                yield setUserId(this.username);
                setAppContainer(appElement);
                setSocket(Step.socket);
                handleSocketEvents();
                const data = checkIfGameIsRunning();
                if (!data)
                    launchUI();
                else
                    launchGame(data);
            }
            catch (error) {
                console.log(error);
                appElement.innerHTML = `<div id="pong-container">An error occurred while generating the content</div>`;
            }
        });
    }
}
