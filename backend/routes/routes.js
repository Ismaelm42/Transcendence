import fastifyPassport from "@fastify/passport";
// import { createUser, getUsers, deleteUserById, getUserByName } from '../db/crud.cjs';
import pkg from '../database/crud.cjs';
const { createUser, getUserById, updateUserbyId, getUserByName, getUserByEmail, getUserByGoogleId, getUsers, deleteUserById, deleteAllUsers} = pkg;
import { checkUser } from '../auth/login.js';
import { verifyToken } from '../auth/jwtValidator.js';
import fastify from "fastify";
import jwt from 'jsonwebtoken';

export default function configureRoutes(fastify, sequelize) {

	// Define a route for /
	fastify.get('/', async (request, reply) => {
		if (request.user && request.user.username)
			return reply.send(`Welcome ${request.user.username}`);
		else
			return reply.send('Welcome stranger');
	});

	// Define a route to handle POST requests
	fastify.post('/api/data', async (request, reply) => {
		console.log('Received data:', request.body);
		return { data_received: request.body };
	});

	// Define a route to handle google login
	fastify.get('/auth/google/login', {
		preValidation: fastifyPassport.authenticate('google', { scope: ['profile', 'email'] })
	},
		async (request, reply) => {
			
			const JWT_SECRET = process.env.JWT_SECRET;

			const token = jwt.sign({ username: request.user.username }, JWT_SECRET, { expiresIn: '1h' });
			
			// Establecer el token como una cookie HTTP-only y secure
			reply.setCookie('token', token, {
				httpOnly: true,
				secure: true, // Asegúrate de que tu servidor esté configurado para HTTPS
				sameSite: 'strict', // Opcional: evita que la cookie sea enviada en solicitudes de terceros
				path: '/', // La cookie estará disponible en toda la aplicación
				maxAge: 3600 // Tiempo de expiración en segundos (1 hora)
				});

			reply.redirect('/back');
		}
	);
	
	fastify.post('/auth/login', async (request, reply) => {
	  const { email, password } = request.body;
	  return checkUser(email, password, reply);
	});

	// Define a route to handle google logout (It doesn't work check case logout and then re-login with google. It automatically logs in and shows the user name again. Maybe it's ok.)
	fastify.get('/auth/google/logout', async (request, reply) => {
		request.logout();
		reply.redirect('/back');
	})

	////////////////////////////////////////// Database //////////////////////////////////////////
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
	fastify.get('/get_user_by_username/',{ preValidation: verifyToken }, async (request, reply) => {
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
			reply.send({ error: 'Error deleting all users '});
		}
	});

}

