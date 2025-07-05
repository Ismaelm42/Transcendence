import jwt from 'jsonwebtoken';
import { crud } from '../crud/crud.js';

export function configureGamelogRoutes(fastify, sequelize) {

	// Define a GET route to retrieve all match history
	fastify.get('/get_gamelogs', async (request, reply) => {
		try {
			const gamelogs = await crud.gamelog.getGamelogs();
			reply.status(200).send(gamelogs);
		} catch (err) {
			fastify.log.error(err);
			reply.status(400).send({ error: 'Error fetching gamelogs '+ err.message });
		}
	});

	// Define a GET route to retrieve gamelogs by userId // Probably not needed
	fastify.get('/get_user_gamelogs/:userId', async (request, reply) => {
		try {
			const userId = request.params.userId;
			const userGamelogs = await crud.gamelog.getGamelogsByUserId(userId);
			reply.status(200).send(userGamelogs);
		} catch (err) {
			fastify.log.error(err);
			reply.status(400).send({ error: 'Error fetching user gamelogs ' + err.message });
		}
	});

	// Define a GET route to retrieve gamelogs by userId from token // Probably needed to be a POST route
	fastify.get('/get_user_gamelogs', async (request, reply) => {
		try {
			const token = request.cookies.token;
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			const userId = decoded.userId;
			const ParamsuserId = request.params.userId;
			console.log('userId en get_user_gamelogs', userId);
			console.log('ParamsuserId en get_user_gamelogs', ParamsuserId);
			const userGamelogs = await crud.gamelog.getGamelogsByUserId(userId);
			reply.status(200).send(userGamelogs);
		} catch (err) {
			fastify.log.error(err);
			reply.status(400).send({ error: 'Error fetching user gamelogs ' + err.message });
		}
	});

	// Define a POST route to create a new gamelog
	fastify.post('/post_gamelog', async (request, reply) => {
		try
		{
			const gamelogData = request.body;
			const gamelog = await crud.gamelog.createGamelog(gamelogData);
			reply.status(201).send(gamelog);
		}
		catch (err)
		{
			fastify.log.error(err);
			reply.status(400).send({ error: 'Error creating gamelog: ' + err.message });
		}
	});
}
