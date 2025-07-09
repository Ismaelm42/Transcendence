import { Step } from "./stepRender.js";
import { showMessage } from "../modal/showMessage.js";
import Game from "../game/Game.js"

export class SPA {
    private container: HTMLElement;
    private static instance: SPA; // Guardamos una referencia estática y privada para solo poder acceder con el getter
	public currentGame: Game | null = null;
	private currentStep: string | null = null;

    private routes: { [key: string]: { module: string; protected: boolean } } = {
        'home': { module: '../home/homeRender.js', protected: false },
        'login': { module: '../login/loginRender.js', protected: false },
        'register': { module: '../login/registerRender.js', protected: false },
        'game-lobby': { module: '../game/Game.js', protected: true },
        'game-match': { module: '../game/GameMatch.js', protected: true },
        'play-tournament': { module: '../tournament/playTournamentRender.js', protected: true },
        'friends': { module: '../friends/friendsRender.js', protected: true },
        'chat': { module: '../chat/chatRender.js', protected: true },
        'stats': { module: '../stats/statsRender.js', protected: true },
        'logout': { module: '../login/logoutRender.js', protected: true },
		'profile': { module: '../profile/userProfileRender.js', protected: true },
		'test': { module: '../game/tournamentGameTest.js', protected: true }
    };

    public constructor(containerId: string) {
        this.container = document.getElementById(containerId) as HTMLElement;
		SPA.instance = this; // Guardamos la instancia en la propiedad estática para poder exportarla
        this.loadHEaderAndFooter();	
		this.loadStep();
        window.onpopstate = () => this.loadStep();
		// this.navigate('home');
		this.currentStep = null;
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

		// Handle leaving game-match step on active game
		if (this.currentStep === 'game-match' && step !== 'game-match' &&
				this.currentGame && this.currentGame.getGameConnection() &&
				this.currentGame.getGameConnection().socket &&
				this.currentGame.isGameActive())
		{
			const	log = this.currentGame.getGameLog();
			const	username = this.currentGame.getGameIsHost()
				? log.playerDetails.player1?.username
				: log.playerDetails.player2?.username;
			this.currentGame.getGameConnection()?.socket?.send(
				JSON.stringify({
					type: 'PAUSE_GAME',
					reason: `${username} left the game`
				 })
			);
		}
        this.currentStep = step;
		
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

