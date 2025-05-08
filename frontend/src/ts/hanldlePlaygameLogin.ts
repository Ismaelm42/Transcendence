// /home/alfofern/TR7/frontend/src/ts/handlePlaygame.ts

export const setupSlider = () => {
	const slider = document.getElementById('slider') as HTMLElement;
	const btnOneP = document.getElementById('btn-one-player') as HTMLElement;
	const btnTwoP = document.getElementById('btn-two-players') as HTMLElement;
	const btnBack = document.getElementById('btn-back-center-left') as HTMLElement;
	const btnBackRight = document.getElementById('btn-back-center-right') as HTMLElement;

	btnBack?.addEventListener('click', resetSlider)
	btnBackRight?.addEventListener('click', resetSlider)
	
	// Mostrar la sección central (segunda)
	if (!slider || !btnOneP || !btnTwoP) {
		console.error('One or more elements are missing in the DOM.');
		return;
	}

	btnTwoP.addEventListener('click', () => {
		// Mostrar la sección derecha (tercera)
		slider.style.transform = 'translateX(-200vw)';
	});
	
	btnOneP.addEventListener('click', () => {
		// Mostrar la sección izquierda (primera)
		slider.style.transform = 'translateX(0vw)';
	});
	formOnePlayerHandler();
	formTwoPlayerHandler();		
	asingOnePlayerGame();
	asingTwoPlayerGame();


};

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

const formOnePlayerHandler = () => {
	const p1email = document.getElementById('player1p-email') as HTMLInputElement;
	const p1password = document.getElementById('player1p-password') as HTMLInputElement;
	const p1insertButton = document.getElementById('btnPLayer1p') as HTMLInputElement;
	const guest1p = document.getElementById('btnguest1p') as HTMLInputElement;
	let habemusP1 = false;

	// Pulsamos guest1p
	guest1p?.addEventListener( 'click', (event: Event) => {
		p1email.value = 'Guest1p@trans.com';
		p1password.value = 'NoPassword';
		removeFluorescentStyle(p1email,2);
		removeFluorescentStyle(p1password,2);
		addFluorescentStyle(p1email,1);
		addFluorescentStyle(p1password,1);
		habemusP1 = true;
	});

	p1insertButton?.addEventListener('click', (event: Event) => {
		event.preventDefault();
		if (habemusP1) {
			p1email.value =  "";
			p1password.value = "";
			removeFluorescentStyle(p1email,1);
			removeFluorescentStyle(p1password,1);
			habemusP1 = false;
			return;
		}
		
		if (p1email.value === "") {
			addFluorescentStyle(p1email,2);
		}else {
			removeFluorescentStyle(p1email,2);
		}
		
		if (p1password.value === "") {
			addFluorescentStyle(p1password,2);
		}else {
			removeFluorescentStyle(p1password,2);
		}
		if (p1email.value !== "" && p1password.value !== "") {
			alert("Llamando a la API");
			// Aquí puedes agregar la lógica para enviar los datos a la API
			
		}
		const user1 = {
			email: p1email.value,
			password: p1password.value
		}
		console.log(user1);

		// agregar aquí la lógica para iniciar el juego de un jugador
	} );
}

const formTwoPlayerHandler = () => {


}


const asingOnePlayerGame = () => {
	const playOneP = document.getElementById('start-1p-game') as HTMLElement;
	if (!playOneP) {
		console.error('Play button for one player is missing in the DOM.');
		return;
	}

	playOneP.addEventListener('click', (event: Event) => {		
		event.preventDefault();
		alert("En submitOnePlayerGame");
		// agregar aquí la lógica para iniciar el juego de un jugador

	});
	
}

const asingTwoPlayerGame = () => {
	const playTwoP = document.getElementById('start-game') as HTMLElement;
	if (!playTwoP) {
		console.error('Play button for two players is missing in the DOM.');
		return;
	}
	playTwoP.addEventListener('click', (event: Event) => {
		event.preventDefault();
		alert("En submitTwoPlayerGame");
		// agregar aquí la lógica para iniciar el juego de dos jugadores
	});

}



export const resetSlider = () => {
	const slider = document.getElementById('slider') as HTMLElement;
	if (!slider) {
		console.error('Slider element is missing in the DOM.');
		return;
	}
	slider.style.transform = 'translateX(-100vw)';
};

// export const submitOnePlayerForm = (event: Event) => {
// 	event.preventDefault();
// 	console.log("En submitOnePlayerForm");
// }
