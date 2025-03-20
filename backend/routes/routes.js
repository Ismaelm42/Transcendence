import { configureAuthRoutes } from './authRoutes.js';
import { configureCrudRoutes } from './crudRoutes.js';

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
		console.log('Received data:', request.body);
		return { data_received: request.body };
	});

	configureAuthRoutes(fastify);
	configureCrudRoutes(fastify);
}

