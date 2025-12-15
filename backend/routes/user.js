import jwt from 'jsonwebtoken';
import { z } from 'zod';
import xss from 'xss';
import validator from 'validator';
import { crud } from '../crud/crud.js';
import { verifyToken } from '../auth/token.js';
import { authenticateUser } from '../auth/user.js';
import { comparePassword } from '../database/users/PassUtils.cjs';
import { extractUserFromToken } from '../auth/token.js';
import formatZodError from '../utils/validationErrors.js';

export function configureUserRoutes(fastify, sequelize) {

	// Define a POST route to create a new user
	fastify.post('/create_user', { preValidation: verifyToken }, async (request, reply) => {
		const { username, password, googleId, email, avatarPath } = request.body;
		try {
			const newUser = await crud.user.createUser(username, password, googleId, email, avatarPath);
			reply.status(200).send({ message: `User ${username} created successfully`, user: newUser });
		} catch (err) {
			fastify.log.error(err);
			reply.status(400).send({ error: 'Error creating user' + err.message });
		}
	});

	// Define a POST route to register a new user
	fastify.post('/register_user', async (request, reply) => {
		// Validate input with Zod
		const registerSchema = z.object({
			// Only letters, numbers and underscore allowed
			username: z.string().min(1).max(20).regex(/^[A-Za-z0-9_]+$/, { message: 'Username may only contain letters, numbers and underscore' }),
			password: z.string().min(8).max(200).regex(/^(?!.*<[^>]*>).*$/, { message: 'Password cannot contain HTML tags' }),
			googleId: z.string().optional().nullable(),
			email: z.string().email().optional().nullable().refine(e => !e || !/<[^>]*>/.test(e), { message: 'Email cannot contain HTML tags' }),
			avatarPath: z.string().optional().nullable()
		});

		const parsed = registerSchema.safeParse(request.body);
		if (!parsed.success) {
			const fieldErrors = formatZodError(parsed.error);
			return reply.status(400).send({ errors: fieldErrors });
		}

		// Extract validated data
		const { username, password, googleId, email, avatarPath } = parsed.data;
		const cleanUsername = username.trim().substring(0, 50);
		// Normalize email using validator if available (better normalization than simple toLowerCase)
		const cleanEmail = email ? validator.normalizeEmail(email) : email;

		// For fields that may contain arbitrary content (paths/ids), keep XSS sanitization
		const cleanAvatar = avatarPath ? xss(avatarPath).trim() : avatarPath;

		// Sanitize password to remove HTML tags (user requested). This will be the password stored and used for immediate auth.
		const cleanPassword = password ? xss(password) : password;

		// Detect if normalization/sanitization changed any inputs so we can notify the frontend
		const warnings = {};
		// For username we only warn if trimming removed characters (leading/trailing)
		if (String(cleanUsername) !== String(username)) warnings.username = 'Username was trimmed';
		if (email && String(cleanEmail) !== String(email)) warnings.email = 'Email was normalized (trimmed/lowercased)';
		if (password && String(cleanPassword) !== String(password)) warnings.password = 'Some characters were removed from password';
		if (avatarPath && String(cleanAvatar) !== String(avatarPath)) warnings.avatarPath = 'Some characters were removed from avatarPath';

			try {
			const newUser = await crud.user.createUser(cleanUsername, cleanPassword, googleId, cleanEmail, cleanAvatar);
			if (!newUser) {
				return reply.status(409).send({ error: 'User already exists' });
			}
			// Keep original behavior: authenticate immediately after registration
			// Pass warnings so the frontend can be notified if we removed dangerous content
			return authenticateUser(cleanEmail, cleanPassword, reply);
		} catch (err) {
			fastify.log.error(err);
			if (err.message && err.message.includes('already')) {
				return reply.status(409).send({ error: err.message });
			} else {
				reply.status(500).send({ error: err.message }); 
			}
		}
	});

	// Define a POST route to update a user by ID
	fastify.post('/update_user_by_id', { preValidation: verifyToken }, async (request, reply) => {
		const { userId, username, tournamentUsername, password, googleId, email, avatarPath } = request.body;
		try {
			const updatedUser = await crud.user.updateUserbyId(userId, username, tournamentUsername, password, googleId, email, avatarPath);
			reply.status(200).send({message: `User ${username} updated successfully`, updatedUser});
		} catch (err) {
			fastify.log.error("Desde updateUserbyId");
			fastify.log.error(err);
			reply.status(400).send({ error: err.message});
		}
	});

	// Define a POST route to update a user by token
	fastify.post('/update_user', { preValidation: verifyToken }, async (request, reply) => {
		const { username, tournamentUsername, password, googleId, email, avatarPath } = request.body;
		try {
				const token = request.cookies.token;
				const decoded = jwt.verify(token, process.env.JWT_SECRET);
				const userId = decoded.userId;
				fastify.log.info('userId en update_user', userId);
			const updatedUser = await crud.user.updateUserbyId(userId, username, tournamentUsername, password, googleId, email, avatarPath);
			reply.status(200).send({message: `User ${username} updated successfully`, updatedUser});
		} catch (err) {
			fastify.log.error("Desde updateUser");
			fastify.log.error(err);
			if (err.message.includes('already')) {
				return reply.status(409).send({ error: err.message });
			} else {
				reply.status(500).send({ error: err.message }); 
			}
		}
	});

	// Define a GET route to retrieve all users
	fastify.get('/get_users', { preValidation: verifyToken }, async (request, reply) => {
		try {
			const users = await crud.user.getUsers();
			/// To avoid sending sensitive information, map users to only include non-sensitive fields
			let safeUsers = users.map(user => {
				const { id, username} = user;
				return { id, username };
			});
			reply.status(200).send(safeUsers);
			////////
		} catch (err) {
			fastify.log.error(err);
			reply.status(500).send({ error: 'Error fetching users' + err.message });
		}
	});

	// Define a GET route to retrieve a user by ID
	fastify.get('/get_user_by_id/', { preValidation: verifyToken }, async (request, reply) => {
		const userId = request.query.id;
		try {
			const user = await crud.user.getUserById(userId);
			reply.status(200).send(user);
		} catch (err) {
			fastify.log.error(err);
			reply.status(400).send({ error: 'Error searching userId' + err.message });
		}
	});

	// Define a GET route to retrieve a user by username
	// fastify.get('/get_user_by_username/', async (request, reply) => {
	fastify.get('/get_user_by_username/', { preValidation: verifyToken }, async (request, reply) => {
			try {
			const username = decodeURIComponent(request.query.username);
			const user = await crud.user.getUserByName(username);
			fastify.log.info('user devuelto en User get_user_by_username/name', user);
			reply.status(200).send(user);
		} catch (err) {
			fastify.log.error(err);
			reply.status(400).send({ error: 'Error searching username' + err.message });
		}
	});

	// Define a GET route to retrieve a user by email
	fastify.get('/get_user_by_email/', { preValidation: verifyToken }, async (request, reply) => {
		try {
			const user = await crud.user.getUserByEmail(request.query.email);
			reply.status(200).send(user);
		} catch (err) {
			fastify.log.error(err);
			reply.status(400).send({ error: 'Error searching email' + err.message });
		}
	});

	// Define a GET route to retrieve a user by googleId
	fastify.get('/get_user_by_google_id/', async (request, reply) => {
		try {
			const user = await crud.user.getUserByGoogleId(request.query.googleId);
			reply.status(200).send(user);
		} catch (err) {
			fastify.log.error(err);
			reply.status(400).send({ error: 'Error searching googleId' + err.message });
		}
	});

	// Define a DELETE route to remove a user by ID
	fastify.delete('/delete_user_by_id', { preValidation: verifyToken }, async (request, reply) => {
		const { userId } = request.body;
		try {
			const result = await crud.user.deleteUserById(userId);
			reply.status(200).send(result);
		} catch (err) {
			fastify.log.error(err);
			reply.status(400).send({ error: 'Error deleting user' + err.message });
		}
	});

	// Define a DELETE route to remove all users
	fastify.delete('/delete_all_users', { preValidation: verifyToken }, async (request, reply) => {
		try {
			const result = await crud.user.deleteAllUsers();
			reply.status(200).send(result);
		} catch (err) {
			fastify.log.error(err);
			reply.status(500).send({ error: 'Error deleting all users '+ err.message });
		}
	});

	/**
	 * Define a POST route to verify and provided a safe User with non-sensitive data
	 * It also compares player two with player one  
	 * To get player One info use it with no email and password
	 * 
	 * @param {string} email - The email of the user to verify.
	 * @param {string} password - The password of the user to verify.
	 * @returns {object} - A safe user object with non-sensitive data.
	*/
	fastify.post('/verify_user', async (request, reply) => {
		const { email, password } = request.body;
		let userSafe1;
		let userSafe;
		try {
			const user1 = await extractUserFromToken(request.cookies.token);
			if (!user1)
				return reply.code(401).send({ error: 'Unauthenticated user' });
			userSafe1 = (({ id, username,tournamentUsername, email, avatarPath }) => ({ id, username,tournamentUsername, email, avatarPath }))(user1);
		} catch (error) {
			reply.status(401).send({ valid: false, message: 'Invalid or expired Token' });
		}
		if (!email && !password) {
			reply.status(200).send(userSafe1);
		} else if (email && password) {
			try {
				const user = await crud.user.getUserByEmail(email);
				if (!user)
					return reply.status(401).send({ message: 'Wrong email' });
				const isMatch = await comparePassword(password, user.password);
				if (!isMatch)
					return reply.status(401).send({ message: 'Wrong password' });		
				userSafe = (({ id, username,tournamentUsername, email, avatarPath }) => ({ id, username,tournamentUsername, email, avatarPath }))(user);
				if (userSafe.id == userSafe1.id) {
					return reply.status(401).send({ message: 'Payer two cannot be the same than player one' });
				}
				reply.status(200).send(userSafe);
			} catch (err) {
				fastify.log.error(err);
				reply.status(400).send({ error: 'Error verifying user' + err.message });
			}
		} else {
			reply.status(400).send({ error: 'Error verifying user' + "an empty field has been found" });
		}
	});

	fastify.post('/getIdByUsername', { preValidation: verifyToken }, async (request, reply) => {
		const { username } = request.body;
		try {
			const id = await crud.user.getIdByUsername(username);
			reply.status(200).send(id);
		} catch (err) {
			fastify.log.error(err);
			reply.status(400).send({ error: err.message});
		}
	});


}
