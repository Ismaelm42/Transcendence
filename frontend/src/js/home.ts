// Función para verificar si el usuario está autenticado
export async function checkAuth() {
    try {
        const response = await fetch("https://localhost:8443/back/auth/verify-token", {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) return null;

        const data = await response.json();
        return data.user.username; // Devuelve el nombre de usuario si está autenticado
    } catch (error) {
        console.error("Error al verificar la autenticación:", error);
        return null;
    }
}

// Función para renderizar el contenido principal
export async function render() {
	const menuContainer = document.getElementById("menu-container");
	try {
        console.log("En render");

        const user = await checkAuth();
    //     return user ? 
	// 		`
    //         <div id="pong-container">
    //             <div class="paddle left-paddle"></div>
    //             <h2>Bienvenido, ${user}!</h2>
    //             <div class="paddle right-paddle"></div>
    //         </div>
    //     ` : `
    //         <div id="pong-container">
    //             <div class="paddle left-paddle"></div>
    //             <div class="ball"><img src="../img/bola.png" alt="Ball"></div>
    //             <div class="paddle right-paddle"></div>
    //         </div>
    //     `;
    // } 
	
	if (user) {
		// Modificar el innerHTML de menuContainer si el usuario está autenticado
		if (menuContainer) {
			menuContainer.innerHTML = `
				<nav id="nav" class="bg-gray-800 p-4">
					<ul class="flex space-x-4">
						<li><a href="#play-pong" class="text-white hover:text-gray-400">Play Game</a></li>
						<li><a href="#play-tournament" class="text-white hover:text-gray-400">Start Tournament</a></li>
						<li><a href="#friends" class="text-white hover:text-gray-400">Friends</a></li>
						<li><a href="#chat" class="text-white hover:text-gray-400">Chat</a></li>
						<li><a href="#stats" class="text-white hover:text-gray-400">Stats</a></li>
					</ul>
				</nav>
			`;
		}

		// Retornar el contenido para usuarios autenticados
		return `
			<div id="pong-container">
				<div class="paddle left-paddle"></div>
				<h2>Bienvenido, ${user}!</h2>
				<div class="paddle right-paddle"></div>
			</div>
		`;
		} else {
			if (menuContainer) {
				menuContainer.innerHTML = "";
			}			

			// Retornar el contenido para usuarios no autenticados
			return `
				<div id="pong-container">
					<div class="paddle left-paddle"></div>
					<div class="ball"><img src="../img/bola.png" alt="Ball"></div>
					<div class="paddle right-paddle"></div>
				</div>
			`;
		}
	} 

	catch (error) {
        console.error("Error en render:", error);
        return `<div id="pong-container">Ocurrió un error al generar el contenido</div>`;
    }
}

// Función para renderizar el header
export async function renderHeader() {
	console.log('En renderHeader');
    try {
        const user = await checkAuth();

        return user ? `
            <div id="authButtons" class="flex items-center">
                <span id="username" class="text-white">${user}</span>
                <div id="headerSeparator" class="vertical-bar"></div>
                <a href="#logout" id="logoutButton" class="text-white hover:text-gray-400">Logout</a>
            </div>
        ` : `
            <div id="authButtons" class="flex items-center">
				<a href="#login" class="text-white hover:text-gray-400">Login</a>
                <div id="headerSeparator" class="vertical-bar"></div>
                <a href="#register" class="text-white hover:text-gray-400 ml-2">Register</a>
            </div>
        `;
    } catch (error) {
        console.error("Error en renderHeader:", error);
        return `<div id="authButtons">Error al cargar el estado de autenticación</div>`;
    }
}




























// function islogged() {
// 	console.log('En home islogged');
// 	// Verificar si el usuario está autenticado
// 	return fetch("https://localhost:8443/back/auth/verify-token", {
//         method: "GET",
//         credentials: "include", // Incluir cookies en la solicitud
//     })
//         .then((response) => {
//             if (response.ok) {
//                 // Si el token es válido, obtener los datos del usuario
//                 return response.json().then((result) => {
//                     // console.log('Token válido:', result);
//                     // console.log(result.user.username);
// 					const user = result.user.username;
//                     // Contenido para usuarios autenticados
// 					return (user);
//                 });
//             } else {
//                 // Si el token no es válido, mostrar contenido para usuarios no autenticados
//                 console.warn('Token inválido o expirado');
//                 return null 
//             }
//         })
//         .catch((error) => {
//             console.error('Error al verificar el token:', error);
// 			const user = null;
//             // Contenido en caso de error
//             return user;
//         });
		
// }

// async function trutru() {
// 	console.log('En trutru render');

//     // Esperar a que la función islogged() se resuelva
//     const user = await islogged();

//     if (user) {
//         console.log('Usuario autenticado:', user);
//         return `
// 			<div id="pong-container">
// 			<div class="paddle left-paddle"></div>
// 			<h2>Bienvenido, ${user}!</h2>
//             <div class="paddle right-paddle"></div>
//             </div>
//         `;
//     } else {
//         console.log('Usuario no autenticado');
//         return `
//             <div>
// 			<div id="pong-container">
// 			<div class="paddle left-paddle"></div>
//             <div class="ball"><img src="../img/bola.png" alt="Ball"></div>
//             <div class="paddle right-paddle"></div>
//             </div>
//         `;
//     }
// }


// export async function render() {
//     try {
//         const content = await trutru(); // Usar await para esperar a que trutru se resuelva
//         return content; // Devolver el contenido HTML
//     } catch (error) {
//         console.error('Error en trutru:', error);
//         return `<div id="pong-container">
//                     Ocurrió un error al generar el contenido
//                 </div>`;
//     }
// }


// export async function render() {
//     try {
//         console.log('En render');

//         // Verificar si el usuario está autenticado
//         const user = await fetch("https://localhost:8443/back/auth/verify-token", {
//             method: "GET",
//             credentials: "include",
//         })
//         .then(response => response.ok ? response.json() : null)
//         .then(data => data ? data.user.username : null)
//         .catch(error => {
//             console.error('Error al verificar el token:', error);
//             return null;
//         });

//         // Generar el contenido según el estado del usuario
//         return user ? `
//             <div id="pong-container">
//                 <div class="paddle left-paddle"></div>
//                 <h2>Bienvenido, ${user}!</h2>
//                 <div class="paddle right-paddle"></div>
//             </div>
//         ` : `
//             <div id="pong-container">
//                 <div class="paddle left-paddle"></div>
//                 <div class="ball"><img src="../img/bola.png" alt="Ball"></div>
//                 <div class="paddle right-paddle"></div>
//             </div>
//         `;
//     } catch (error) {
//         console.error('Error en render:', error);
//         return `<div id="pong-container">Ocurrió un error al generar el contenido</div>`;
//     }
// }








































// export function render() {
// 	let content = '';
// 	trutru().then((result) => {
// 		content = result;
// 	}).catch((error) => {
// 		console.error('Error en trutru:', error);
// 		content = `<div id="pong-container">
// 					Ocurrió un error al generar el contenido
// 				   </div>`;
// 	});

// 	return content || `<div id="pong-container">
// 						Cargando contenido...
// 					   </div>`;
// } //         <div id="pong-container">
    //             <p>Bienvenido, ${user}!</p>
    //             <div class="paddle left-paddle"></div>
    //             <div class="ball"><img src="../img/bola.png" alt="Ball"></div>
    //             <div class="paddle right-paddle"></div>
    //         </div>
    //     `;
    // } else {
    //     console.log('Usuario no autenticado');
    //     return `
    //         <div>
    //             <h1>Por favor, inicia sesión para continuar</h1>
    //             <a href="#login" id="loginLink">Iniciar sesión</a>
    //         </div>
    //     `;
    // }
// }

// 
// export function render() {
// 
	// const user = islogged();
	// console.log('En render', user);
	// console.log('En render', user.then((user) => {return user;})); 
// 
// }

    // console.log('En home render');
	
	// islogged().then((user) => {
	// 	console.log('user en render= ', user);
	// 	if (!!user)
	// 		return`<div id="pong-container">
	// 				Hola holita
	// 					// <div class="paddle left-paddle"></div>
	// 					// <div class="ball"><img src="../img/bola.png" alt="Ball"></div>
	// 					// <div class="paddle right-paddle"></div>
	// 				</div>`;  

	// 	else
	// 		return `<p>Bienvenido, ${user}!</p>`;
	// 				});
	// return `<div id="pong-container">
	// 				No ha devuelto nada desde islogged
	// 				</div>`;
				// }

// export function render() {
//     console.log('En home render');

//     // Llamar a la API para verificar el token
//     return fetch("https://localhost:8443/back/auth/verify-token", {
//         method: "GET",
//         credentials: "include", // Incluir cookies en la solicitud
//     })
//         .then((response) => {
//             if (response.ok) {
//                 // Si el token es válido, obtener los datos del usuario
//                 return response.json().then((result) => {
//                     console.log('Token válido:', result);
//                     console.log(result.user.username);

//                     // Contenido para usuarios autenticados
//                     return `
//                         <p>Bienvenido, ${result.user.username}!</p>
//                     `;
//                 });
//             } else {
//                 // Si el token no es válido, mostrar contenido para usuarios no autenticados
//                 console.warn('Token inválido o expirado');
//                 return `
//                     <div id="pong-container">
//                         <div class="paddle left-paddle"></div>
//                         <div class="ball"><img src="../img/bola.png" alt="Ball"></div>
//                         <div class="paddle right-paddle"></div>
//                     </div>`;
//             }
//         })
//         .catch((error) => {
//             console.error('Error al verificar el token:', error);

//             // Contenido en caso de error
//             return `
//                 <div>
//                     <h1>Ocurrió un error al verificar tu sesión</h1>
//                     <a href="#login" id="loginLink">Intenta iniciar sesión nuevamente</a>
//                 </div>
//             `;
//         });
// }
	// export function render() {
    //     console.log('En home render');

	// 	const response = `<div id="pong-container">
    //             <div class="paddle left-paddle"></div>
    //             <div class="ball"><img src="../img/bola.png" alt="Ball"></div>
    //             <div class="paddle right-paddle"></div>
    //             </div>`;

    //     return response;
    // }





    // export function renderHeader() {
    //     console.log('En home renderHeader');
    //     return `<div id="authButtons" class="flex items-center">
    //                 <span id="username" class="text-white">trutru</span>
    //                 <div id="headerSeparator" class="vertical-bar"></div>
	// 				<a href="#logout" id="logoutButton" class="text-white hover:text-gray-400">
	// 				Logout
	// 				</a>
    //             </div>`;
    // }




// }
	// 	// Cargar el header
	// 	const headerResponse = await fetch('../html/header.html');
	// 	if (headerResponse.ok) {
	// 		const headerContent = await headerResponse.text();
	// 		const headerElement = document.getElementById('header-container');
	// 		if (headerElement) {
	// 			headerElement.innerHTML = headerContent;
	// 		}
	// 	} else {
	// 		console.error('Error al cargar el header:', headerResponse.statusText);
	// 	}
	// 	const appElement = document.getElementById('app-container');
	// 	// const welcomeMessage = '<h1> Welcome</h1>';
	// 	const welcomeMessage =
	// 		`<div id="pong-container">
	// 		<div class="paddle left-paddle"></div>
	// 		<div class="ball"><img src="../img/bola.png" alt="Ball"></div>
	// 		<div class="paddle right-paddle"></div>
	// 		</div>`;
	// 	if (appElement) {
	// 		appElement.innerHTML = welcomeMessage;
	// 	}
	// } catch (error) {
	// 	console.error('Error al cargar el header o footer:', error);
	// }
	// 	return;
	// }


	// <a href="#login" id="loginButton" class="text-white hover:text-gray-400">Login</a>
	// 			<div id ="headerSeparator" class="vertical-bar"></div>
	// 			<a href="#register" id="registerButton" class="text-white hover:text-gray-400">Register</a>

// 	<div id="authButtons" class="flex items-center">
// 	<a href="#login" id="loginButton" class="text-white hover:text-gray-400">Login</a>
// 	<div id ="headerSeparator" class="vertical-bar"></div>
// 	<a href="#register" id="registerButton" class="text-white hover:text-gray-400">Register</a>
// 	<!-- <span id="username" class="text-white"></span>
// 	<a href="#logout" id="logoutButton" class="text-white hover:text-gray-400 hidden">Logout</a> -->
// </div>
