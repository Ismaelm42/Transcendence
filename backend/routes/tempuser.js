import { crud } from '../crud/crud.js';

export function configureTempUserRoutes(fastify, sequelize) {

	// Define a POST route to create a new user
	fastify.post('/create_temp_user', async (request, reply) => {
		const { tournamentId, tournamentName } = request.body;
		console.log('Creating temp user with:', tournamentId, tournamentName);
		try {
			const newTempUser = await crud.tempuser.createTempuser(tournamentId, tournamentName);
			reply.status(200).send({ message: `User ${tournamentName} created successfully`, tournamentName: tournamentName });
		} catch (err) {
			fastify.log.error(err);
			reply.status(400).send({ error: 'Error creating user' + err.message });
		}
	});

	// Define a GET route to retrieve all users
	fastify.get('/get_temp_users', async (request, reply) => {
		try {
			const tempUsers = await crud.tempuser.getTempUsers();
			reply.status(200).send(tempUsers);
		} catch (err) {
			fastify.log.error(err);
			reply.status(500).send({ error: 'Error fetching users' + err.message });
		}
	});

	// Define a DELETE route to remove a user by ID
	fastify.delete('/delete_user_by_tournament_id', async (request, reply) => {
		const { TournamentId } = request.body;
		console.log(`[DEBUG] delete_user_by_tournament_id called for TournamentId: ${TournamentId}`);
		try {
			const result = await crud.tempuser.deleteTempuserByTournamentId(TournamentId);
			reply.status(200).send(result);
		} catch (err) {
			fastify.log.error(err);
			reply.status(400).send({ error: 'Error deleting user' + err.message });
		}
	});

	// prepared just in case we need to use send.beacon that appaently only works with POST

	// fastify.post('/clean_temp_user_after_closing', async (request, reply) => {
	// 	console.log('Cleaning temp users after closing tournament');
	// 	const { tournamentId } = request.body;
	// 	try {
	// 		const result = await crud.tempuser.deleteTempuserByTournamentId(tournamentId);
	// 		reply.status(200).send(result);
	// 	} catch (err) {
	// 		fastify.log.error(err);
	// 		reply.status(400).send({ error: 'Error deleting user' + err.message });
	// 	}
	// });

	// Define a DELETE route to remove all users
	fastify.delete('/delete_all_temp_users', async (request, reply) => {
		try {
			const result = await crud.tempuser.deleteAllUsers();
			reply.status(200).send(result);
		} catch (err) {
			fastify.log.error(err);
			reply.status(500).send({ error: 'Error deleting all users ' + err.message });
		}
	});
}