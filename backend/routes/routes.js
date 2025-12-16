import { configureUserRoutes } from './user.js';
import { configureAuthRoutes } from './auth.js';
import { configureImageRoutes } from './image.js';
import { configureGamelogRoutes } from './gamelog.js';
import { configureFriendRoutes } from './friend.js';
import { configureChatRoutes } from './chat.js';
import { configureOnlineSocket } from '../websockets/online/onlineUsers.js';
import { configureGameRoutes } from './game.js';
import { configureTournamentRoutes } from './tournament.js';
import { configureTempUserRoutes } from './tempuser.js';
import { configureTournamentlogRoutes } from './tournamentlog.js';
import { configureChessgamelogRoutes } from './chessgamelog.js';

import { configureChessRoutes } from './chess.js';

export default function configureRoutes(fastify, sequelize) {

	// Define a test route for back/
	fastify.get('/', async (request, reply) => {
		if (request.user && request.user.username)
			return reply.send(`Welcome ${request.user.username}`);
		else
			return reply.send('Welcome stranger');
	});

	// Define a test route to handle POST requests
	fastify.post('/api/data', async (request, reply) => {
		return { data_received: request.body };
	});

	configureUserRoutes(fastify);
	configureAuthRoutes(fastify);
	configureOnlineSocket(fastify);
	configureImageRoutes(fastify);
	configureGamelogRoutes(fastify);
	configureFriendRoutes(fastify);
	configureChatRoutes(fastify);
	configureChessRoutes(fastify);
	configureGameRoutes(fastify);
	configureTournamentRoutes(fastify);
	configureTempUserRoutes(fastify);	// todo: comentar en productivo para mayor seguridad
	configureTournamentlogRoutes(fastify);
	configureChessgamelogRoutes(fastify);
}
