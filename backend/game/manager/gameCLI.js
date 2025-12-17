/**
 * gameLogs.js file to manage the partial usage of the game via CLI
 * - work in progress - this is only a draft/idea/example
 * The idea is creating a basic interface that interacts with CLI connected
 *  client (using wscat command) which offer a limited set of game commands
 */

// Accept self-signed certificates for local dev and silence warnings about it
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
process.removeAllListeners('warning');

import fetch from 'node-fetch';
import WebSocket from 'ws';
import readline from 'readline';
import https from 'https';

let cliInput;

function initCLI() {
	cliInput = readline.createInterface({ input: process.stdin, output: process.stdout });
}

initCLI();

let inGame = false;
let myPlayerNumber = null;
let lastState = null;

// Usage message for the CLI
function usage() {
	console.log(`
Available commands:
		join           - Create game session

		join <gameID>  - Join existing game session

		ready          - Ready to start

		list           - List available games

		exit           - You can guess...

		help           - Show this usage message
`);
}

// Prompt for password with hidden input
function promptPassword(query) {
	return new Promise((resolve) => {
		if (cliInput) {
			cliInput.close();
			cliInput = null;
		}
		process.stdin.setRawMode(true);
		process.stdin.resume();
		process.stdout.write(query);

		let password = '';
		const onData = (data) => {
			const char = data.toString();
			
			// Enter
			if (char === '\n' || char === '\r') {
				process.stdin.removeListener('data', onData);
				process.stdin.setRawMode(false);
				process.stdin.pause();
				process.stdout.write('\n');
				initCLI();
				resolve(password);
				return;
			}
			
			// Ctrl+C
			if (char === '\u0003') {
				process.exit();
			}
			
			// Backspace
			if (char === '\u007f') {
				if (password.length > 0) {
					password = password.slice(0, -1);
					process.stdout.write('\b \b');
				}
				return;
			}
			
			// Regular char
			password += char;
			process.stdout.write('*');
		};
		
		process.stdin.on('data', onData);
	});
}

// Prompt user for email and password
async function promptCredentials() {
	return new Promise((resolve) => {
		cliInput.question('Email: ', async (email) => {
			const password = await promptPassword('Password: ');
			resolve({ email, password });
		});
	});
}

// Compute base origins from environment (minimal, no extra deps)
const BASE_ORIGIN = process.env.BASE_ORIGIN
	|| (process.env.HOST_IP ? `https://${process.env.HOST_IP}` : null);
const BACK_PREFIX = (process.env.BACK_PREFIX !== undefined) ? process.env.BACK_PREFIX : '/back';
const WS_ORIGIN = BASE_ORIGIN
	? (BASE_ORIGIN.startsWith('https://')
		? BASE_ORIGIN.replace(/^https:\/\//, 'wss://')
		: BASE_ORIGIN.replace(/^http:\/\//, 'ws://'))
	: null;

// Authenticate user and extract token from cookie
async function loginAndGetToken(email, password) {
	if (!BASE_ORIGIN) {
		console.error('Missing BASE_ORIGIN or HOST_IP environment. Set BASE_ORIGIN (e.g., https://localhost:8443)');
		process.exit(1);
	}
	const res = await fetch(`${BASE_ORIGIN}${BACK_PREFIX}/auth/login`, {
		method: 'POST',
		body: JSON.stringify({ email, password }),
		headers: { 'Content-Type': 'application/json' },
		agent: new https.Agent({ rejectUnauthorized: false }),
	});

	if (!res.ok)
		return null;

	const cookies = res.headers.raw()['set-cookie'];
	if (!cookies)
		return null;
	const tokenCookie = cookies.find(c => c.startsWith('token='));
	if (!tokenCookie)
		return null;
	return tokenCookie.split(';')[0].split('=')[1];
}

// CLI command loop
function insertCommand(socket) {
	if (inGame) return; // Don't prompt if in game

	cliInput.question('> ', (cmd) => {
		if (inGame) return; // Ignore input if game started while waiting

		const [command, arg] = cmd.trim().split(' ');
		switch (command) {
			case 'join':
				socket.send(JSON.stringify({
					type: 'JOIN_GAME',
					mode: 'remote',
					...(arg ? { roomId: arg } : {})
				}));
				break;
			case 'ready':
				socket.send(JSON.stringify({ type: 'CLIENT_READY' }));
				break;
			case 'list':
				socket.send(JSON.stringify({ type: 'SHOW_GAMES' }));
				break;
			case 'exit':
				socket.close();
				return;
			case 'help':
				usage();
				break;
			default:
				console.log('Unknown command. Type "help" for usage.');
		}
		insertCommand(socket);
	});
}

// ASCII Game Renderer
function renderGame(state) {
	const width = 60;
	const height = 20;
	const paddleHeight = Math.floor(0.15 * height); // 15% of height
	
	// Clear screen
	console.clear();

	// Draw Top Border
	console.log('+' + '-'.repeat(width) + '+');

	for (let y = 0; y < height; y++) {
		let row = '|';
		for (let x = 0; x < width; x++) {
			const normalizedX = x / width;
			const normalizedY = y / height;

			// Check Ball
			// Simple proximity check
			const ballX = Math.floor(state.ball.x * width);
			const ballY = Math.floor(state.ball.y * height);
			
			// Check Paddles
			const p1Y = Math.floor(state.paddles.player1.y * height);
			const p2Y = Math.floor(state.paddles.player2.y * height);
			
			const paddleHalf = Math.floor(paddleHeight / 2);

			let char = ' ';

			if (x === ballX && y === ballY) {
				char = 'O';
			} else if (x >= 0 && x <= 2) {
				// Player 1 Paddle (Left)
				if (y >= p1Y - paddleHalf && y <= p1Y + paddleHalf) char = ']';
			} else if (x >= width - 3 && x <= width - 1) {
				// Player 2 Paddle (Right)
				if (y >= p2Y - paddleHalf && y <= p2Y + paddleHalf) char = '[';
			} else if (x === width / 2) {
				char = '.'; // Net
			}

			row += char;
		}
		row += '|';
		console.log(row);
	}

	// Draw Bottom Border
	console.log('+' + '-'.repeat(width) + '+');
	
	// Draw Scores
	console.log(` Player 1: ${state.scores[0]}  |  Player 2: ${state.scores[1]}`);
	console.log(` [W/S] Move  |  [Q] Quit Game`);
}

function enableGameInput(socket) {
	process.stdin.setRawMode(true);
	process.stdin.resume();
	process.stdin.on('data', onGameInput);
	
	function onGameInput(key) {
		if (!inGame) return;

		const char = key.toString();
		
		// Exit game
		if (char === 'q' || char === '\u0003') { // q or Ctrl+C
			socket.send(JSON.stringify({ type: 'LEAVE_GAME' }));
			stopGameMode(socket);
			return;
		}

		// Movement
		if (char === 'w') {
			socket.send(JSON.stringify({ 
				type: 'PLAYER_INPUT', 
				input: { up: true, down: false, player: myPlayerNumber } 
			}));
		} else if (char === 's') {
			socket.send(JSON.stringify({ 
				type: 'PLAYER_INPUT', 
				input: { up: false, down: true, player: myPlayerNumber } 
			}));
		}
	}

	// Store reference to remove listener later
	socket.gameInputListener = onGameInput;
}

function stopGameMode(socket) {
	inGame = false;
	process.stdin.setRawMode(false);
	if (socket && socket.gameInputListener) {
		process.stdin.removeListener('data', socket.gameInputListener);
	}
	initCLI();
	console.clear();
	console.log('Game ended.');
	usage();
	insertCommand(socket);
}

// Handle incoming WebSocket messages
function handleSocketMessages(socket) {
	socket.on('message', (data) => {
		try {
			const msg = JSON.parse(data);
			
			if (msg.type === 'GAME_STATE') {
				if (!inGame) {
					inGame = true;
					// Pause CLI input
					if (cliInput) cliInput.close();
					enableGameInput(socket);
				}
				lastState = msg.state;
				if (msg.state.playerNumber) {
					myPlayerNumber = msg.state.playerNumber;
				}
				renderGame(msg.state);
			} else if (msg.type === 'GAME_END' || msg.type === 'ERROR') {
				if (inGame) {
					stopGameMode(socket);
				}
				console.log('Server:', msg);
			} else if (msg.type === 'GAME_INIT') {
				console.log('Game Initialized. Type "ready" to start.');
			} else {
				if (!inGame) {
					console.log('Server:', msg);
				}
			}
		} catch (e) {
			console.log('Server:', data.toString());
		}
	});

	socket.on('close', () => {
		console.log('Connection closed.');
		process.exit(0);
	});
}

// Main logic: handle token or login, then connect to WebSocket
(async () => {
	let token = null;

	// Check for --token argument
	const tokenArgIndex = process.argv.indexOf('--token');
	if (tokenArgIndex !== -1 && process.argv[tokenArgIndex + 1])
		token = process.argv[tokenArgIndex + 1];
	else {
		console.log('Please log in:');
		const { email, password } = await promptCredentials();
		token = await loginAndGetToken(email, password);
		if (!token) {
			console.log('Login failed. Please check your credentials.');
			process.exit(1);
		}
	}

	if (!WS_ORIGIN) {
		console.error('Missing BASE_ORIGIN or HOST_IP environment. Set BASE_ORIGIN (e.g., https://localhost:8443)');
		process.exit(1);
	}
	const socket = new WebSocket(`${WS_ORIGIN}${BACK_PREFIX}/ws/game`, {
		headers: { Cookie: `token=${token}` },
		agent: new https.Agent({ rejectUnauthorized: false }),
	});

	socket.on('open', () => {
		console.log('Connected to game server.');
		usage();
		insertCommand(socket); // Only start command loop after connection
	});

	handleSocketMessages(socket);
})();
