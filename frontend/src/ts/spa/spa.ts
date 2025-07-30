import { Step } from "./stepRender.js";
import { showMessage } from "../modal/showMessage.js";
import Game from "../game/Game.js"
import Tournament from "../tournament/Tournament.js";

export class SPA {
    private container: HTMLElement;
    private static instance: SPA; // Guardamos una referencia estática y privada para solo poder acceder con el getter
	public currentGame: Game | null = null;
	public currentTournament: Tournament | null = null;

    private routes: { [key: string]: { module: string; protected: boolean } } = {
        'home': { module: '../home/homeRender.js', protected: false },
        'login': { module: '../login/loginRender.js', protected: false },
        'register': { module: '../login/registerRender.js', protected: false },
        'game-lobby': { module: '../game/Game.js', protected: true },
        'game-match': { module: '../game/GameMatch.js', protected: true },
        'tournament-lobby': { module: '../tournament/Tournament.js', protected: true },
        'friends': { module: '../friends/friendsRender.js', protected: true },
        'chat': { module: '../chat/chatRender.js', protected: true },
        'stats': { module: '../stats/statsRender.js', protected: true },
        'logout': { module: '../login/logoutRender.js', protected: true },
		'profile': { module: '../profile/userProfileRender.js', protected: true }
    };

    public constructor(containerId: string) {
        this.container = document.getElementById(containerId) as HTMLElement;
		SPA.instance = this; // Guardamos la instancia en la propiedad estática para poder exportarla
        this.loadHEaderAndFooter();	
		this.loadStep();
		// Changes to advise the user when they leave a tournament in progress
		//it will reset the tournament guards and delete TempUsers
		window.onpopstate = () => {
			if (this.currentTournament && typeof this.currentTournament.getTournamentId === 'function') {
				const tournamentId = this.currentTournament.getTournamentId();
				const warningFlag = this.currentTournament.LeaveWithoutWarningFLAG;
				if (typeof tournamentId !== 'undefined' && tournamentId !== null && tournamentId > -42
					&& warningFlag!== true) {
					showMessage("Tournament in progress aborted?", 5000);
					const tournamentUI = this.currentTournament.getTournamentUI?.();
					if (tournamentUI && typeof tournamentUI.resetTournament === 'function') {
						tournamentUI.resetTournament();
					}
					const messageContainer = document.getElementById("message-container");

						// En lugar de usar async/await, puedes usar un setInterval para comprobar periódicamente si el modal está oculto y luego ejecutar el código necesario.
						const intervalId = setInterval(() => {
							if (messageContainer?.style.display === 'none') {
								clearInterval(intervalId);
								// Aquí puedes colocar el código que quieras ejecutar después de que el modal se cierre
							}
						}, 1000);
					
				}
				const step = location.hash.replace('#', '') || 'home';
				this.loadStep();
			}else {
				const step = location.hash.replace('#', '') || 'home';
				this.loadStep();
				}
			}
		
		// this.navigate('home');

		window.addEventListener("pageshow", (event) => {
			if (event.persisted && location.hash === '#login') {
				console.log("Recargando el step de login" );
				const appContainer = document.getElementById('app-container');
				if (appContainer) {
					appContainer.innerHTML = '';
				}
				this.loadStep(); // Vuelve a cargar el step para forzar la lógica
			}
		});
    }

    private async loadHEaderAndFooter() {

        try {
			// cargar el header

			const headerResponse = await fetch('../../html/layout/header.html');
			if (headerResponse.ok) {
				const headerContent = await headerResponse.text();
				const headerElement = document.getElementById('header-container');
				if (headerElement) {
					headerElement.innerHTML = headerContent;
				}
			} else {
				console.error('Error al cargar el header:', headerResponse.statusText);
			}
			// Cargar el footer
            const footerResponse = await fetch('../../html/layout/footer.html');
            if (footerResponse.ok) {
                const footerContent = await footerResponse.text();
                const footerElement = document.getElementById('footer-container');
                if (footerElement) {
                    footerElement.innerHTML = footerContent;
                }
				console.log ('footer cargado');
            } else {
                console.error('Error al cargar el footer:', footerResponse.statusText);
            }
        } catch (error) {
            console.error('Error al cargar el footer:', error);
        }
    }

    navigate(step: string) {
        history.pushState({}, '', `#${step}`);
        this.loadStep();
    }

	async loadStep() {
		let step = location.hash.replace('#', '') || 'home';
		// this.navigate(step);

		// // Obtener la URL actual
		// let currentUrl = window.location.href;

		// // Eliminar todo lo que está después de la última barra
		// let baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/') + 1);

		// // Modificar la URL para que termine con /#home
		// let newUrl = baseUrl + '#home';

		// // Actualizar la URL sin recargar la página
		// history.replaceState(null, '', newUrl);
		console.log('loadStep currentTournament: ', this.currentTournament);

		const routeConfig = this.routes[step];
		if (routeConfig) {
			//importamos el módulo correspondiente
			const module = await import(`./${routeConfig.module}`);
			// game-lobby <-> game-match communication
			let stepInstance;
			if (step === 'game-match')
			{	
				stepInstance = new module.default(this.currentGame);
				if (this.currentGame && stepInstance)
					this.currentGame.setGameMatch(stepInstance);
			}
			else if (step === 'game-lobby')
			{
				stepInstance = new module.default('app-container');
				this.currentGame = stepInstance;
			}
			else if (step === 'tournament-lobby')
			{
				stepInstance = new module.default('app-container');
				this.currentTournament = stepInstance;
				console.log('tournament-lobby currentTournament: ', this.currentTournament);
			}
			else
				stepInstance = new module.default('app-container');
			// Verificamos si el usuario está autenticado
			const user = await stepInstance.checkAuth();
			if (user) {
				console.log("Usuario autenticado: ", user);
			} else {
				console.log("Usuario no autenticado: ", user);
			}
			if (routeConfig.protected && !user) {
				console.warn(`Acceso denegado a la ruta protegida: ${step}`);
				this.navigate('login'); // Redirigir al usuario a la página de login
				return;
			}
			await stepInstance.init(); // Inicializar el módulo
		} else {
			showMessage('url does not exist', 2000);
			window.location.hash = '#home'; 
		}
	}

    // isAuthenticated(): boolean {
	// 	//hardcode para las pruebas
    //     // return false; // Aquí iría la lógica real de autenticación
	// 	return true; // Para pruebas, siempre autenticado
    // }

    // // Método estático para acceder a la instancia de SPA
    // static getInstance(): SPA {
    //     return SPA.instance;
    // }

	public static getInstance(): SPA {
		return SPA.instance;
	}

}

document.addEventListener('DOMContentLoaded', () => new SPA('content'));

