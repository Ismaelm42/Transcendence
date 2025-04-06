import { verifyToken } from '../auth/authToken.js';
import { createUser, getUserById, updateUserbyId, getUserByName, getUserByEmail, getUserByGoogleId, getUsers, deleteUserById, deleteAllUsers, getGamelogs, getGamelogsByUserId } from '../database/crud.cjs';

export function configureCrudRoutes(fastify) {
// Define all CRUD routes here

	// Define a POST route to create a new user
	fastify.post('/create_user', async (request, reply) => {
		const { username, password, googleId, email, avatarPath } = request.body;
		try {
			const newUser = await createUser(username, password, googleId, email, avatarPath);
			reply.send({ message: `User ${username} created successfully`, user: newUser });
		} catch (err) {
			fastify.log.error(err);
			reply.send({ error: 'Error creating user' + err.message });
		}
	});

	fastify.post('/register_user', async (request, reply) => {
		const { username, password, googleId, email, avatarPath } = request.body;
		try {
			const newUser = await createUser(username, password, googleId, email, avatarPath);
			if (!newUser) {
				return reply.status(409).send({ error: 'User already exists' });
			}
			return authenticateUser(email, password, reply);
		} catch (err) {
			fastify.log.error(err);
			if (err.message === 'Username already exists') {
				return reply.status(409).send({ error: err.message });
			}
			if (err.message === 'Email already exists') {
				return reply.status(409).send({ error: err.message });
			} else {
			reply.status(500).send({ error: `Error creating user : ${err.message}`}); 
			}
		}
	});


	// Define a POST route to update a user by ID
	fastify.post('/update_user_by_id', async (request, reply) => {
		const { userId, username, password, googleId, email, avatarPath } = request.body;
		try {
			const updatedUser = await updateUserbyId(userId, username, password, googleId, email, avatarPath);
			reply.send({message: `User ${username} updated successfully`, updatedUser});
		} catch (err) {
			fastify.log.error(err);
			reply.send({ error: 'Error updating user' + err.message });
		}
	});

	// Define a GET route to retrieve all users
	fastify.get('/get_users', async (request, reply) => {
		try {
			const users = await getUsers();
			reply.send(users);
		} catch (err) {
			fastify.log.error(err);
			reply.send({ error: 'Error fetching users' + err.message });
		}
	});

	// Define a GET route to retrieve a user by ID
	fastify.get('/get_user_by_id/', async (request, reply) => {
		const userId = request.query.id;
		try {
			const user = await getUserById(userId);
			reply.send(user);
		} catch (err) {
			fastify.log.error(err);
			reply.send({ error: 'Error searching userId' + err.message });
		}
	});

	// Define a GET route to retrieve a user by username
	fastify.get('/get_user_by_username/', { preValidation: verifyToken }, async (request, reply) => {
		try {
			const user = await getUserByName(request.query.username);
			reply.send(user);
		} catch (err) {
			fastify.log.error(err);
			reply.send({ error: 'Error searching username' + err.message });
		}
	});

	// Define a GET route to retrieve a user by email
	fastify.get('/get_user_by_email/', async (request, reply) => {
		try {
			const user = await getUserByEmail(request.query.email);
			reply.send(user);
		} catch (err) {
			fastify.log.error(err);
			reply.send({ error: 'Error searching email' + err.message });
		}
	});

	// Define a GET route to retrieve a user by googleId
	fastify.get('/get_user_by_google_id/', async (request, reply) => {
		try {
			const user = await getUserByGoogleId(request.query.googleId);
			reply.send(user);
		} catch (err) {
			fastify.log.error(err);
			reply.send({ error: 'Error searching googleId' + err.message });
		}
	});

	// Define a DELETE route to remove a user by ID
	fastify.delete('/delete_user_by_id', async (request, reply) => {
		const { userId } = request.body;
		try {
			const result = await deleteUserById(userId);
			reply.send(result);
		} catch (err) {
			fastify.log.error(err);
			reply.send({ error: 'Error deleting user' + err.message });
		}
	});

	// Define a DELETE route to remove all users
	fastify.delete('/delete_all_users', async (request, reply) => {
		try {
			const result = await deleteAllUsers();
			reply.send(result);
		} catch (err) {
			fastify.log.error(err);
			reply.send({ error: 'Error deleting all users '+ err.message });
		}
	});

	// Define a GET route to retrieve all match history
	fastify.get('/get_gamelogs', async (request, reply) => {
		try {
			const gamelogs = await getGamelogs();
			reply.send(gamelogs);
		} catch (err) {
			fastify.log.error(err);
			reply.send({ error: 'Error fetching gamelogs '+ err.message });
		}
	});

	fastify.get('/get_user_gamelogs/:userId', async (request, reply) => {
		try {
			const userId = request.params.userId;
			const userGamelogs = await getGamelogsByUserId(userId);
			reply.send(userGamelogs);
		} catch (err) {
			fastify.log.error(err);
			reply.send({ error: 'Error fetching user gamelogs' + err.message });
		}
	});

}
