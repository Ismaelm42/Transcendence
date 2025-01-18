// Obtén el botón y el contenedor de la SPA
const playButton = document.getElementById('playButton');
const app = document.getElementById('app');

// Maneja el evento de clic en el botón
playButton.addEventListener('click', () => {
	// Limpia el contenedor (en caso de futuros cambios)
	app.innerHTML = '';

	// Crea el canvas
	const canvas = document.createElement('canvas');
	canvas.width = 800; // Ancho del canvas
	canvas.height = 600; // Alto del canvas
	canvas.id = 'gameCanvas';

	// Añade el canvas al contenedor
	app.appendChild(canvas);

	// Opcional: Configuración inicial del canvas
	const ctx = canvas.getContext('2d');
	ctx.fillStyle = '#f0f0f0';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
});
