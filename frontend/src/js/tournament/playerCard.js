var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class PlayerCard {
    constructor(playerIndex, container, scriptHandler) {
        console.log("Creating PlayerCard component");
        console.log("Player index:", playerIndex);
        console.log("Container element:", container);
        this.player_index = playerIndex;
        this.templatePath = "../html/tournament/PlayerForm.html";
        this.scriptHandler = scriptHandler;
        this.el = container;
        this.render(this.el);
        this.tournamentPlayer = {
            Index: playerIndex.toString(),
            status: 'pending', // Initial status
            gameplayer: { id: '', username: '', tournamentUsername: '', email: '', avatarPath: '' } // Assuming GamePlayer has these properties
        };
    }
    render(target_1) {
        return __awaiter(this, arguments, void 0, function* (target, placeholders = {}) {
            const html = yield this.loadTemplate();
            const parsed = html.replace(/\{\{\s*userIndex\s*\}\}/g, this.player_index.toString());
            // const parsed = this.replacePlaceholders(html, placeholders);
            const wrapper = document.createElement('div');
            // console.log("Parsed HTML:", parsed);
            wrapper.innerHTML = parsed;
            this.el = wrapper.firstElementChild;
            target.appendChild(this.el);
            if (this.scriptHandler)
                this.scriptHandler();
            this.setupEventListeners();
            // while (1)
            // {
            // 	if (this.tournamentPlayer.status != 'ready')
            // 	{
            // 		console.log("Waiting for playerCard " + (this.player_index + 1 ) + " to be ready");
            // 	} else 
            // 	{
            // 		break;
            // 	}
            // // Wait for the player to be ready
            // }
        });
    }
    // Sets up event listeners for game mode buttons, which after will also set controllers
    setupEventListeners() {
        const playersLoginForm = document.getElementById(`players-login-form-${this.player_index}`);
        const playerEmail = document.getElementById(`players-email-${this.player_index}`);
        const playerPassword = document.getElementById(`players-password-${this.player_index}`);
        if (playersLoginForm) {
            playersLoginForm.addEventListener('submit', (event) => {
                event.preventDefault();
                console.log(`Player ${this.player_index} login form submitted`);
                console.log(`Email: ${playerEmail === null || playerEmail === void 0 ? void 0 : playerEmail.value}, Password: ${playerPassword === null || playerPassword === void 0 ? void 0 : playerPassword.value}`);
                console.log(`playerPassword: ${playerPassword === null || playerPassword === void 0 ? void 0 : playerPassword.value}`);
                // Handle login logic here
            });
        }
        const playersLogintBtn = document.getElementById(`players-login-btn-${this.player_index}`);
        const guestTournamentName = document.getElementById(`guest-tournament-name-${this.player_index}`);
        const guestLoginForm = document.getElementById(`guests-login-form-${this.player_index}`);
        if (guestLoginForm) {
            guestLoginForm.addEventListener('submit', (event) => {
                event.preventDefault();
                console.log(`Guest Player ${this.player_index} login form submitted`);
                console.log(`Guest Tournament Name: ${guestTournamentName === null || guestTournamentName === void 0 ? void 0 : guestTournamentName.value}`);
                // Handle guest login logic here
            });
        }
        const PlayAsGuestBtn = document.getElementById(`players-guest-btn-${this.player_index}`);
        if (playersLogintBtn) {
            playersLogintBtn.addEventListener('click', (event) => {
                event.preventDefault();
                console.log(`Player ${this.player_index} login button clicked`);
                // Handle login logic here
            });
        }
        const ErrorContainer = document.getElementById(`players-login-error-${this.player_index}`);
        const AiplayerBtn = document.getElementById(`players-ai-btn-${this.player_index}`);
        if (AiplayerBtn) {
            AiplayerBtn.addEventListener('click', (event) => {
                event.preventDefault();
                console.log(`AI Player ${this.player_index} button clicked`);
            });
        }
    }
    loadTemplate() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(this.templatePath);
            return yield response.text();
        });
    }
}
