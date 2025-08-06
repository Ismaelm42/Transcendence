import jwt from 'jsonwebtoken';
import { crud } from '../crud/crud.js';

export function configureTournamentlogRoutes(fastify, sequelize) {

	// Define a GET route to retrieve all match history
	fastify.get('/get_tournamentlogs', async (request, reply) => {
		try {
			const tournamentlogs = await crud.tournamentlog.getTournamentlogs();
			reply.status(200).send(tournamentlogs);
		} catch (err) {
			fastify.log.error(err);
			reply.status(400).send({ error: 'Error fetching tournamentlogs '+ err.message });
		}
	});

	// Define a GET route to retrieve tournamentlogs by userId // Probably not needed
	fastify.get('/get_user_tournamentlogs/:userId', async (request, reply) => {
		try {
			const userId = request.params.userId;
			const userTournamentlogs = await crud.tournamentlog.getTournamentlogsByUserId(userId);
			reply.status(200).send(userTournamentlogs);
		} catch (err) {
			fastify.log.error(err);
			reply.status(400).send({ error: 'Error fetching user tournamentlogs ' + err.message });
		}
	});

	// Define a GET route to retrieve tournamentlogs by userId from token // Probably needed to be a POST route
	fastify.get('/get_user_tournamentlogs', async (request, reply) => {
		try {
			const token = request.cookies.token;
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			const userId = decoded.userId;
			const ParamsuserId = request.params.userId;
			console.log('userId en get_user_tournamentlogs', userId);
			console.log('ParamsuserId en get_user_tournamentlogs', ParamsuserId);
			const userTournamentlogs = await crud.tournamentlog.getTournamentlogsByUserId(userId);
			reply.status(200).send(userTournamentlogs);
		} catch (err) {
			fastify.log.error(err);
			reply.status(400).send({ error: 'Error fetching user tournamentlogs ' + err.message });
		}
	});
	
	/**
	 * 
	 * /get_next_tournamentlog:
	 *   get:
	 *     summary: Get the next tournamentlog ID
	 *     description: Fetches the next tournamentlog ID based on the latest created tournamentlog
	 * 					create a new tournamentlog with the next ID to avoid conflicts
	 *     responses:
	 *       200:
	 *         description: Successfully retrieved the next tournamentlog id
	 */
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
			const {tournamentId, playerscount, config, users, gamesData} = request.body;
			const newTournamentlog = await crud.tournamentlog.createTournamentlog(tournamentId, playerscount, config, users, gamesData);
			reply.status(201).send(newTournamentlog);
		} catch (err) {
			fastify.log.error(err);
			reply.status(400).send({ error: 'Error creating tournamentlog: ' + err.message });
		}
	});

	fastify.delete('/delete_tournamentlogs', async (request, reply) => {
		try {
			await crud.tournamentlog.deleteAllTournamentlogs();
			reply.status(200).send({ message: 'All tournamentlogs deleted successfully' });
		} catch (err) {
			fastify.log.error(err);
			reply.status(400).send({ error: 'Error deleting tournamentlogs: ' + err.message });
		}
	});

	fastify.post('/update_tournamentlog', async (request, reply) => {
		try {
			const {tournamentId, playerscount, config, users, gamesData, winner} = request.body;
			const updatedTournamentlog = await crud.tournamentlog.updateTournamentlog(tournamentId, playerscount, config, users, gamesData, winner);
			reply.status(200).send(updatedTournamentlog);
		} catch (err) {
			fastify.log.error(err);
			reply.status(400).send({ error: 'Error updating tournamentlog: ' + err.message });
		}
	});
}
