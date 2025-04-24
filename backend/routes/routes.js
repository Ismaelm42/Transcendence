import { configureUserRoutes } from './user.js';
import { configureAuthRoutes } from './auth.js';
import { configureImageRoutes } from './image.js';
import { configureGamelogRoutes } from './gamelog.js';
import { configureFriendRoutes } from './friend.js';

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
		fastify.log.info({ body: request.body }, 'Received data');
		return { data_received: request.body };
	});

	configureUserRoutes(fastify);
	configureAuthRoutes(fastify);
	configureImageRoutes(fastify);
	configureGamelogRoutes(fastify);
	configureFriendRoutes(fastify);
}

