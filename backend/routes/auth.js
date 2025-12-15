import jwt from 'jsonwebtoken';
import fastifyPassport from "@fastify/passport";
import xss from 'xss';
import { z } from 'zod';
import validator from 'validator';
import formatZodError from '../utils/validationErrors.js';
import { crud } from '../crud/crud.js';
import { comparePassword } from '../database/users/PassUtils.cjs';
import { authenticateUser, signOutUser } from "../auth/user.js";
import { extractUserFromToken, setTokenCookie } from "../auth/token.js";
import { disconnectUser } from "../websockets/chat/chat.js";

const JWT_SECRET = process.env.JWT_SECRET;

export function configureAuthRoutes(fastify, sequelize) {

	// Define a POST route to authenticate an user
	fastify.post('/auth/login', async (request, reply) => {
		fastify.log.info({ body: request.body }, 'login data sent');

		const loginSchema = z.object({
			email: z.string().email().refine(e => !/<[^>]*>/.test(e), { message: 'Email cannot contain HTML tags' }),
			password: z.string().min(8).max(200).regex(/^(?!.*<[^>]*>).*$/, { message: 'Password cannot contain HTML tags' }),
			googleId: z.string().optional().nullable(),
			email: z.string().email().optional().nullable().refine(e => !e || !/<[^>]*>/.test(e), { message: 'Email cannot contain HTML tags' }),
		});

		const parsed = loginSchema.safeParse(request.body);
		if (!parsed.success) {
			const fieldErrors = formatZodError(parsed.error);
			return reply.status(400).send({ errors: fieldErrors });
		}

		// Extract validated fields
		const { email, password } = parsed.data;

		// Normalize email so uppercase inputs match lowercase DB entries
		const normalized = validator.normalizeEmail(email) || email.trim().toLowerCase();

		// Sanitize password to remove HTML tags (keeps behavior consistent with registration)
		const cleanPassword = password ? xss(password) : password;

		return authenticateUser(normalized, cleanPassword, reply);
	});

	// Define a GET route to authenticate an user with GoogleStrategy
	fastify.get('/auth/google/login', {
		preValidation: fastifyPassport.authenticate('google', { scope: ['profile', 'email'] })
	},
		async (request, reply) => {
			setTokenCookie(request.user.id, reply);
			reply.redirect('https://localhost:8443/#home');
		}
	);

	// Define a POST route to logout an user
	fastify.post('/auth/logout', async (request, reply) => {
		const token = request.cookies.token
		const user = await extractUserFromToken(token, reply);
		disconnectUser(user);
		await signOutUser(token, user, reply);
	});

	fastify.get('/auth/verify-token', async (request, reply) => {
	    try {
	        const token = request.cookies.token;
	        if (!token) {
	            return reply.status(401).send({ message: 'Token no incluido' });
	        }
	        // Verificar el token
	        const decodedId = jwt.verify(token, JWT_SECRET);
			const decoded = await crud.user.getUserById(decodedId.userId);
	        reply.send({ valid: true, user: decoded });
	    } catch (error) {
	        reply.status(401).send({ valid: false, message: 'Invalid or expired Token' });
	    }
	});

	fastify.post('/change_password', async (request, reply) => {
		// fastify.log.info({ body: request.body }, 'change_password data sent');
	let { currentPassword, newPassword, confirmPassword } = request.body;
	// Sanitize passwords to remove HTML tags before comparison/storage (consistent with registration sanitization)
	currentPassword = currentPassword ? xss(currentPassword) : currentPassword;
	newPassword = newPassword ? xss(newPassword) : newPassword;
	confirmPassword = confirmPassword ? xss(confirmPassword) : confirmPassword;
		try {
			const token = request.cookies.token;
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			const userId = decoded.userId;
			const user = await crud.user.getUserById(userId);
			if (!user) {
				return reply.status(401).send({ message: 'User not found' });
			}
			
			fastify.log.info({ user }, 'user data');
			fastify.log.info ( user.password , 'user password');
			fastify.log.info ({ currentPassword }, 'current password');
			if (currentPassword !== "" || currentPassword.trim().length > 0 || user.password ) {
				const isMatch = await comparePassword(currentPassword, user.password);
				if (!isMatch)
					return reply.status(401).send({ message: 'Wrong current password' });
				if (newPassword !== confirmPassword) { 	// No es estrictamente necesario, ya que se hace desde el front.
					return reply.status(401).send({ message: 'Passwords are not identical' });
				}
			}
			const username = user.username;
			const password = newPassword;
			const updatedUser = await crud.user.updateUserbyId(userId, username, null, password);
			reply.send({message: `User ${username} updated successfully` + updatedUser});
		} catch (err) {
			fastify.log.error(err);
			reply.status(500).send({ error: 'Error changing password: ' + err.message });
		}
	});
}
