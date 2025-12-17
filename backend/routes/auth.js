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

	fastify.post('/auth/login', async (request, reply) => {
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

		const { email, password } = parsed.data;
		const normalized = email.trim().toLowerCase();
		const cleanPassword = password ? xss(password) : password;
		return authenticateUser(normalized, cleanPassword, reply);
	});

	fastify.get('/auth/google/login', {
		preValidation: fastifyPassport.authenticate('google', { scope: ['profile', 'email'] })
	},
		async (request, reply) => {
			setTokenCookie(request.user.id, reply);
			reply.redirect('https://localhost:8443/#home');
		}
	);

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
		
		const passSchema = z.object({
			currentPassword: z.string().min(8).max(200).regex(/^(?!.*<[^>]*>).*$/, { message: 'currentPassword cannot contain HTML tags' }),
			newPassword: z.string().min(8).max(200).regex(/^(?!.*<[^>]*>).*$/, { message: 'newPassword cannot contain HTML tags' }),
			confirmPassword: z.string().min(8).max(200).regex(/^(?!.*<[^>]*>).*$/, { message: 'confirmPassword cannot contain HTML tags' }),
		});

		const parsed = passSchema.safeParse(request.body);
		if (!parsed.success) {
			const fieldErrors = formatZodError(parsed.error);
			return reply.status(400).send({ errors: fieldErrors });
		}
			let { currentPassword, newPassword, confirmPassword } = request.body;

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
