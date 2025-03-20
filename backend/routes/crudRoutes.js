import { verifyToken } from '../auth/jwtValidator.js';
import { createUser, getUserById, updateUserbyId, getUserByName, getUserByEmail, getUserByGoogleId, getUsers, deleteUserById, deleteAllUsers} from '../database/crud.cjs';

export function configureCrudRoutes(fastify) {
// Define all CRUD routes here

	// Define a POST route to create a new user
	fastify.post('/create_user', async (request, reply) => {
		const { username, password, email } = request.body;
		console.log('Username:', username);
		try {
			const newUser = await createUser(username, password, email);
			reply.send({ message: `User ${username} created successfully`, user: newUser });
		} catch (err) {
			fastify.log.error(err);
			reply.send({ error: `Error creating user : ${err.message}` });
		}
	});

	// Define a POST route to update a user by ID
	fastify.post('/update_user_by_id', async (request, reply) => {
		const { userId, username, password, googleId, email, avatarPath } = request.body;
		try {
			const updatedUser = await updateUserbyId(userId, username, password, googleId, email, avatarPath);
			reply.send(updatedUser);
		} catch (err) {
			fastify.log.error(err);
			reply.send({ error: `Error updating user : ${err.message}` });
		}
	});

	// Define a GET route to retrieve all users
	fastify.get('/get_users', async (request, reply) => {
		try {
			const users = await getUsers();
			reply.send(users);
		} catch (err) {
			fastify.log.error('Cannot list users', err);
			reply.send({ error: 'Error fetching users' });
		}
	});

	// Define a GET route to retrieve a user by ID
	fastify.get('/get_user_by_id/', async (request, reply) => {
		const userId = request.query.id;
		try {
			const user = await getUserById(userId);
			reply.send(user);
		} catch (err) {
			fastify.log.error('User not found', err);
			reply.send({ error: 'User not found' });
		}
	});

	// Define a GET route to retrieve a user by username
	fastify.get('/get_user_by_username/', { preValidation: verifyToken }, async (request, reply) => {
		try {
			const user = await getUserByName(request.query.username);
			reply.send(user);
		} catch (err) {
			fastify.log.error('User not found', err);
			reply.send({ error: 'User not found' });
		}
	});

	// Define a GET route to retrieve a user by email
	fastify.get('/get_user_by_email/', async (request, reply) => {
		try {
			const user = await getUserByEmail(request.query.email);
			reply.send(user);
		} catch (err) {
			fastify.log.error('User not found', err);
			reply.send({ error: 'User not found' });
		}
	});

	// Define a GET route to retrieve a user by googleId
	fastify.get('/get_user_by_google_id/', async (request, reply) => {
		try {
			const user = await getUserByGoogleId(request.query.googleId);
			reply.send(user);
		} catch (err) {
			fastify.log.error('User not found', err);
			reply.send({ error: 'User not found' });
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
			reply.send({ error: 'Error deleting user' });
		}
	});

	// Define a DELETE route to remove all users
	fastify.delete('/delete_all_users', async (request, reply) => {
		try {
			const result = await deleteAllUsers();
			reply.send(result);
		} catch (err) {
			fastify.log.error(err);
			reply.send({ error: 'Error deleting all users ' });
		}
	});
}
