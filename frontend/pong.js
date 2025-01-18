// Código de prueba
const playButton = document.getElementById('playButton');
const app = document.getElementById('app');

playButton.addEventListener('click', () => {
	app.innerHTML = '';

	const canvas = document.createElement('canvas');
	canvas.width = 800;
	canvas.height = 600;
	canvas.id = 'gameCanvas';

	app.appendChild(canvas);

	const ctx = canvas.getContext('2d');
	ctx.fillStyle = '#f0f0f0';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
});
