import { showMessage } from './showMessage.js';

/** Global variables to set the game config when we need to start each game */
let habemusP2 = false;
let user1P: { id: string; username: string; tournamentUsername: string; email: string; avatarPath: string } | number | null = null;
let user2P: { id: string; username: string; tournamentUsername: string; email: string; avatarPath: string } | number | null = null;

/* setupSlider function to handle the slider functionality for each part*/
export const setupSlider = () => {
	// asigning html elements to variables
	const slider = document.getElementById('slider') as HTMLElement;
	const btnOneP = document.getElementById('btn-one-player') as HTMLElement;
	const btnTwoP = document.getElementById('btn-two-players') as HTMLElement;
	const btnBack = document.getElementById('btn-back-center-left') as HTMLElement;
	const btnBackRight = document.getElementById('btn-back-center-right') as HTMLElement;

	/** Slider Navigations button */
	btnBack?.addEventListener('click', resetSlider)
	btnBackRight?.addEventListener('click', resetSlider)
	
	// check if the elements exist
	if (!slider || !btnOneP || !btnTwoP || !btnBackRight) {
		console.error('One or more elements are missing in the DOM.');
		return;
	}
	// Add event listeners to the 2 player button to display the right side with the form
	btnTwoP.addEventListener('click', () => {
		// Mostrar la sección derecha (tercera)
		slider.style.transform = 'translateX(-100vw)';
	});
	// Add event listeners to the 1 player button to start the game
	btnOneP.addEventListener('click', startOnePLayerGame);
	// call the funtion to handle the 2 player form
	formTwoPlayerHandler();
};


/**
 * Asynchronously verifies a player's credentials by sending a POST request to the server.
 *
 * @param email - The email address of the player. Can be `null` if not provided.
 * @param password - The password of the player. Can be `null` if not provided.
 * @returns A promise that resolves to `true` if the player is successfully verified, or `false` if verification fails.
 *
 * @remarks
 * - If both `email` and `password` are `null`, the response is assigned to `user1P`.
 * - If either `email` or `password` is provided, the response is assigned to `user2P`.
 * - Displays an error message using `showMessage` if the server responds with an error.
 * - Logs an error to the console if the request fails due to a network or other unexpected issue.
 *
 * @throws This function does not throw errors directly but logs them to the console in case of a failure.
 */
async function checkPlayer (email: string |null, password: string|null) {
	const data = {
		email: email,
		password: password
	}
	try {
		const response = await fetch("https://localhost:8443/back/verify_user", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});
		if (!response.ok) {
			const result = await response.json();
			showMessage(`Error: ${result.message}`, null);
			return false;
		} else {
			const result = await response.json();
			// console.log("Verified!:", result);
			if (email === null && password === null) {
				user1P = result;
				return true;
			}
			user2P = result;
			return true;
		}
	} catch (error) {
		console.error("Error while verifying:", error);
	}
};


/**
 * Initiates the process for starting a single-player game.
 * 
 * This function calls `checkPlayer` with `null` parameters.
 * This verifies the player's eligibility and get the info that can
 * be used to start the game. If the verification is successful, it logs a 
 * message and checks if `user1P` is defined and not a number. If these 
 * conditions are met, it displays an alert with the player's username.
 * 
 * @remarks
 * The function currently includes a placeholder (`TODO`) for implementing 
 * the logical steps required to start a single-player game.
 * 
 * @throws Will log an error to the console if the verification process fails.
 */
const startOnePLayerGame = () => {

	checkPlayer(null,null).then ((result) => {;
	if (result) {
		console.log("En startOnePLayerGame");
		if (user1P && typeof user1P !== 'number') {
			alert("Que comiencen los juegos: " + user1P.username);
		}
		// TODO: Incluir pasos lógicos para iniciar el juego de un jugador
	}
	}).catch((error) => {
		console.error("Error en la verificación:", error);
	});

}

const startTwoPLayerGame = () => {
	console.log("En startTwoPLayerGame");
	if (user1P && typeof user1P !== 'number' && user2P && typeof user2P !== 'number') {
		alert("Que comiencen los juegos: " + user1P.username + " Vs " + user2P.username);
	}
	// TODO: Incluir pasos lógicos para iniciar el juego de dos jugadores
}

/**
 * Add fluorescent style to an input element 
 * @param input html element to add the style
 * @param color 1, green; 2, red
 */
const addFluorescentStyle = (input:HTMLElement, color:number) => {
	if (color === 1) {
		input.classList.add(
			'border-2',
			'border-green-400',
			'focus:border-green-500',
			'shadow-[0_0_10px_rgba(34,197,94,0.7)]',
			'focus:shadow-[0_0_15px_rgba(34,197,94,1)]',
			'outline-none'
		);
	} else if (color === 2) {
		input.classList.add(
			'border-2',
			'border-red-400',
			'focus:border-red-500',
			'shadow-[0_0_10px_rgba(239,68,68,0.7)]',
			'focus:shadow-[0_0_15px_rgba(239,68,68,1)]',
			'outline-none'
		);
	}
	};

/**
 * Remove fluorescent style to an input element 
 * @param input html element to remove the style
 * @param color 1, green; 2, red
 */
const removeFluorescentStyle = (input:HTMLElement, color:number) => {
if (color === 1) {
	input.classList.remove(
		'border-2',
		'border-green-400',
		'focus:border-green-500',
		'shadow-[0_0_10px_rgba(34,197,94,0.7)]',
		'focus:shadow-[0_0_15px_rgba(34,197,94,1)]',
		'outline-none'
	);
} else if (color === 2) {
	input.classList.remove(
		'border-2',
		'border-red-400',
		'focus:border-red-500',
		'shadow-[0_0_10px_rgba(239,68,68,0.7)]',
		'focus:shadow-[0_0_15px_rgba(239,68,68,1)]',
		'outline-none'
	);
}
}

const activatePlayButton = () => {
	const playTwoP = document.getElementById('start-2p-game') as HTMLInputElement;
	console.log("En activatePlayButton");
	playTwoP.classList.remove(
		'bg-slate-500');
	playTwoP.classList.add(
		'bg-green-500',
		'border-green-500',
		'hover:bg-green-600',
		'focus:outline-none',
		'focus:ring-2',
		'focus:ring-green-500'
		);
		if (!habemusP2)
			playTwoP.addEventListener('click', startTwoPLayerGame);
}

const DeactivatePlayButton = () => {
	const playTwoP = document.getElementById('start-2p-game') as HTMLInputElement;
	playTwoP.classList.remove(
		'bg-green-500',
		'border-green-500',
		'hover:bg-green-600',
		'focus:outline-none',
		'focus:ring-2',
		'focus:ring-green-500'
		);
	playTwoP.classList.add(
		'bg-slate-500');
	console.log("En DeactivatePlayButton");
	console.log("habemusP2: ", habemusP2);
	if (habemusP2)
		playTwoP.removeEventListener('click', startTwoPLayerGame);
}

const resetInputsEffects = () => {
	const P2email = document.getElementById('player2p-email') as HTMLInputElement;
	const p2password = document.getElementById('player2p-password') as HTMLInputElement;
		removeFluorescentStyle(P2email,2);
		removeFluorescentStyle(P2email,1);
		removeFluorescentStyle(p2password,2);
		removeFluorescentStyle(p2password,1);
}

const formTwoPlayerHandler = () => {
	const P2email = document.getElementById('player2p-email') as HTMLInputElement;
	const p2password = document.getElementById('player2p-password') as HTMLInputElement;
	const P2insertButton = document.getElementById('btnPLayer2p') as HTMLInputElement;
	const guest2p = document.getElementById('btnguest2p') as HTMLInputElement;

	P2email.addEventListener('input', (event: Event) => {
		resetInputsEffects();
		DeactivatePlayButton();
		habemusP2 = false;
	});

	p2password.addEventListener('input', (event: Event) => {
		resetInputsEffects();
		DeactivatePlayButton();
		habemusP2 = false;
	});

	// Pulsamos guest2p
	guest2p?.addEventListener( 'click', (event: Event) => {
		P2email.value = 'Guest';
		p2password.value = 'NoPassword';
		removeFluorescentStyle(P2email,2);
		removeFluorescentStyle(p2password,2);
		addFluorescentStyle(P2email,1);
		addFluorescentStyle(p2password,1);
		user2P = {
					"id": "-42",
					"username": "Guest",
					"tournamentUsername": "alfoGuestnso",
					"email": "Guest@mail.com",
					"avatarPath": "https://localhost:8443/back/images/default-avatar.png"
				  }
		activatePlayButton();
		console.log("user2P: ", user2P);
		habemusP2 = true;
	});

	P2insertButton?.addEventListener('click', (event: Event) => {
		event.preventDefault();
		if (habemusP2) {
			P2email.value =	"";
			p2password.value = "";
			removeFluorescentStyle(P2email,1);
			removeFluorescentStyle(p2password,1);
			DeactivatePlayButton();
			habemusP2 = false;
			return;
		}
		
		/* Control campos vacíos */
		
		if (P2email.value === "") {
			addFluorescentStyle(P2email,2);
		}else {
			removeFluorescentStyle(P2email,2);
		}	

		if (p2password.value === "") {
			addFluorescentStyle(p2password,2);
		}else {
			removeFluorescentStyle(p2password,2);
		}
		/*  fin control campos vacíos     */

		if (P2email.value !== "" && p2password.value !== "") {
			// player 1
			checkPlayer(null,null);
			// player 2
			checkPlayer(P2email.value, p2password.value).then ((result) => {;
			if (result) {
				console.log("En checkPlayer2P, user2P: ", user2P);
				addFluorescentStyle(P2email,1);
				addFluorescentStyle(p2password,1);
				activatePlayButton();
				habemusP2 = true;
			}else {
				addFluorescentStyle(P2email,2);
				addFluorescentStyle(p2password,2);
				DeactivatePlayButton();
				habemusP2 = false;
			}
			}).catch((error) => {
				console.error("Error en la verificación:", error);
			});
			
		}
		// startTwoPLayerGame(P2email.value);

		console.log(user2P);
		// agregar aquí la lógica para iniciar el juego de un jugador
	} );
}

export const resetSlider = () => {
	const slider = document.getElementById('slider') as HTMLElement;
	if (!slider) {
		console.error('Slider element is missing in the DOM.');
		return;
	}
	slider.style.transform = 'translateX(00vw)';
};
