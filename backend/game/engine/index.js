/**
 * index.js will work as a header file to include methods of GameSession class
 * this way we can have the game logic separated in several files for better readbility
 * Attach all methods to the class by using the syntax: "class.prototype.method = method" 
 */
import GameSession from './GameSession.js';
import { resetState, update, checkScoring, endGame, setDifficulty } from './gameState.js';
import { resetBall, checkPaddleCollision } from './physics.js';
import { addPlayer, removePlayer, getPlayerView, movePlayerPaddle, startAI, setPlayerDetails } from './players.js';
import { broadcastState, getConnections } from './network.js';
import { finalizeGame, getGamelogData, saveGameToDatabase } from './gameLogs.js';

// From gameState.js
GameSession.prototype.resetState = resetState;
GameSession.prototype.update = update;
GameSession.prototype.checkScoring = checkScoring;
GameSession.prototype.endGame = endGame;
GameSession.prototype.setDifficulty = setDifficulty;

// From physics.js
GameSession.prototype.checkPaddleCollision = checkPaddleCollision;
GameSession.prototype.resetBall = resetBall;

// From players.js
GameSession.prototype.addPlayer = addPlayer;
GameSession.prototype.getPlayerView = getPlayerView;
GameSession.prototype.removePlayer = removePlayer;
GameSession.prototype.startAI = startAI;
GameSession.prototype.movePlayerPaddle = movePlayerPaddle;
GameSession.prototype.setPlayerDetails = setPlayerDetails;

// From network.js
GameSession.prototype.getConnections = getConnections;
GameSession.prototype.broadcastState = broadcastState;

// From gameLogs.js
GameSession.prototype.finalizeGame = finalizeGame;
GameSession.prototype.getGamelogData = getGamelogData;
GameSession.prototype.saveGameToDatabase = saveGameToDatabase;

export default GameSession;
