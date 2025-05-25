/**
 * index.js will work as a header file to include methods of GameSession class
 * this way we can have the game logic separated in several files for better readbility
 * Attach all methods to the class by using the syntax: "class.prototype.method = method" 
 */
import GameSession from './GameSession.js';
import { resetState, update, checkScoring } from './gameState.js';
import { resetBall, checkPaddleCollision } from './physics.js';
import { addPlayer, removePlayer, getPlayerView, handleInput, startAI } from './players.js';
import { broadcastState, getConnections } from './network.js';

// From gameState.js
GameSession.prototype.resetState = resetState;
GameSession.prototype.update = update;
GameSession.prototype.checkScoring = checkScoring;

// From physics.js
GameSession.prototype.checkPaddleCollision = checkPaddleCollision;
GameSession.prototype.resetBall = resetBall;

// From players.js
GameSession.prototype.addPlayer = addPlayer;
GameSession.prototype.getPlayerView = getPlayerView;
GameSession.prototype.removePlayer = removePlayer;
GameSession.prototype.startAI = startAI;
GameSession.prototype.handleInput = handleInput;

// From network.js
GameSession.prototype.getConnections = getConnections;
GameSession.prototype.broadcastState = broadcastState;

export default GameSession;
