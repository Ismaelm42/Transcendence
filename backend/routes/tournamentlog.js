import jwt from 'jsonwebtoken';
import { crud } from '../crud/crud.js';

export function configureTournamentlogRoutes(fastify, sequelize) {

	// Define a GET route to retrieve all match history
	fastify.get('/get_toutnamentlogs', async (request, reply) => {
		try {
			const toutnamentlogs = await crud.toutnamentlog.getTournamentlogs();
			reply.status(200).send(toutnamentlogs);
		} catch (err) {
			fastify.log.error(err);
			reply.status(400).send({ error: 'Error fetching toutnamentlogs '+ err.message });
		}
	});

	// Define a GET route to retrieve toutnamentlogs by userId // Probably not needed
	fastify.get('/get_user_toutnamentlogs/:userId', async (request, reply) => {
		try {
			const userId = request.params.userId;
			const userTournamentlogs = await crud.toutnamentlog.getTournamentlogsByUserId(userId);
			reply.status(200).send(userTournamentlogs);
		} catch (err) {
			fastify.log.error(err);
			reply.status(400).send({ error: 'Error fetching user toutnamentlogs ' + err.message });
		}
	});

	// Define a GET route to retrieve toutnamentlogs by userId from token // Probably needed to be a POST route
	fastify.get('/get_user_toutnamentlogs', async (request, reply) => {
		try {
			const token = request.cookies.token;
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			const userId = decoded.userId;
			const ParamsuserId = request.params.userId;
			console.log('userId en get_user_toutnamentlogs', userId);
			console.log('ParamsuserId en get_user_toutnamentlogs', ParamsuserId);
			const userTournamentlogs = await crud.toutnamentlog.getTournamentlogsByUserId(userId);
			reply.status(200).send(userTournamentlogs);
		} catch (err) {
			fastify.log.error(err);
			reply.status(400).send({ error: 'Error fetching user toutnamentlogs ' + err.message });
		}
	});
	
	fastify.get('/get_next_tournamentlog', async (request, reply) => {
		try {
			// const nextTournamentlogId = "43"; // Placeholder for the next tournamentlog ID"
			const nextTournamentlogId = await crud.tournamentlog.getNextTournamentlogId();
			console.log('Next tournamentlog ID:', nextTournamentlogId);
			reply.status(200).send({ nextTournamentlogId });
		} catch (err) {
			fastify.log.error(err);
			reply.status(400).send({ error: 'Error fetching next tournamentlog ID: ' + err.message });
		}
	} );
	
	fastify.post('/create_tournamentlog', async (request, reply) => {
		try {
			const tournamentlogData = request.body;
			const newTournamentlog = await crud.tournamentlog.createTournamentlog(tournamentlogData);
			reply.status(201).send(newTournamentlog);
		} catch (err) {
			fastify.log.error(err);
			reply.status(400).send({ error: 'Error creating tournamentlog: ' + err.message });
		}
	});
}
