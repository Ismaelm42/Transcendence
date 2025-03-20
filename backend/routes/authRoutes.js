import fastifyPassport from "@fastify/passport";
import jwt from 'jsonwebtoken';
import { authenticateUser } from "../auth/authHandler.js";

export function configureAuthRoutes(fastify) {

	// Define a POST route to authenticate an user
	fastify.post('/auth/login', async (request, reply) => {
		const { email, password } = request.body;
		return authenticateUser(email, password, reply);
	});

	// Define a POST route to logout an user
	fastify.post('/auth/logout', async (request, reply) => {
		const { email, password } = request.body;
	});

	// Define a GET route to authenticate an user with GoogleStrategy
	fastify.get('/auth/google/login', {
		preValidation: fastifyPassport.authenticate('google', { scope: ['profile', 'email'] })
	},
		async (request, reply) => {

			const JWT_SECRET = process.env.JWT_SECRET;
			const token = jwt.sign({ username: request.user.username }, JWT_SECRET, { expiresIn: '1h' });
			reply.setCookie('token', token, {
				httpOnly: true,
				secure: true,
				sameSite: 'strict',
				path: '/',
				maxAge: 3600,
			});
			reply.redirect('/');
		}
	);

	// Define a GET route to logout an user with GoogleStrategy
	fastify.get('/auth/google/logout', async (request, reply) => {
		request.logout();
	})
}
