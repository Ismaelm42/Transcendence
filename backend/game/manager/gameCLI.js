/**
 * gameLogs.js file to manage the partial usage of the game via CLI
 * - work in progress - this is only a draft/idea/example
 * The idea is creating a basic interface that interacts with CLI connected
 *  client (using wscat command) which offer a limited set of game commands
 */

// TODO: Do I need to add something to make this script exectuble from terminal?
// Main variables for the use of the CLI client-server interface
const   WebSocket = require('ws');
const   readline = require('readline');
const   socket = new WebSocket(`https://${window.location.host}/back/ws/game`);
const   cliInput = readline.createInterface({input: process.stdin, output: process.stdout});
let     joined = false;
let     playerNumber = null;

// Socket event listeners setup
// 1. On first connection - open -> send usage and listen to input
socket.on('open', () => {
    console.log('Connected to server');
    showUsage();
    insertCommand();
});

// 2. For each type of message
socket.on('message', (data) => {
    try
    {
        const msg = JSON.parse(data);
        if (msg.type === 'GAME_INIT')
        {
            joined = true;
            playerNumber = msg.playerNumber;
            console.log('Joined to game as palyer ', playerNumber);
            console.log('Config:', msg.config);
        }
        else if (msg.type === 'GAME_STATE')
        {
            console.log('Game current state:', msg.state);
        }
        else if (msg.type === 'GAME_START') 
        {
            console.log('Match begins!');
        } 
        else if (msg.type === 'GAME_END')
        {
            console.log('Game finished:', msg.result);
        }
        else if (msg.type === 'ERROR')
        {
            console.log('Error:', msg.message);
        }
        else
        {
            console.log('Message:', msg);
        }
    }
    catch (e){
        console.log('Error on message received:', data);
    }
});

// 3. When socket connection is closed or left
socket.on('close', () => {
    console.log('Connection closed');
    process.exit(0);
});

// 4. Error handling
socket.on('error', (err) => {
    console.error('Connection error:', err.message);
    process.exit(1);
});

function showUsage()
{
    console.log(`Comandos disponibles:
    join           - Join (if id provided) or create game session

    ready          - Ready to start

    up             - Move paddle up

    down           - Move paddle down

    exit           - You can guess...

    `);
}

function insertCommand()
{
    cliInput.question('> ', (cmd) => {
        if (cmd === 'join')
        {
            socket.send(JSON.stringify({
                type: 'JOIN_GAME',
                mode: '1v1',
            }));
        } 
        else if (cmd === 'ready' && joined)
        {
            socket.send(JSON.stringify({ type: 'CLIENT_READY' }));
        }
        else if ((cmd === 'up' || cmd === 'down') && joined)
        {
            socket.send(JSON.stringify({
                type: 'PLAYER_INPUT',
                input: { up: cmd === 'up', down: cmd === 'down', player: playerNumber }
            }));
        }
        else if (cmd === 'exit')
        {
            socket.close();
            cliInput.close();
            return ;
        }
        else
        {
            showUsage();
        }
        insertCommand();
    });
}
