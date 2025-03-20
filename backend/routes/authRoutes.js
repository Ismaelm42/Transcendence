import fastifyPassport from "@fastify/passport";
import { authenticateUser } from "../auth/authUser.js";
import { setTokenCookie } from "../auth/authToken.js";

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
			setTokenCookie(request.user.username, reply);
			reply.redirect('/back');
		}
	);

	// Define a GET route to logout an user with GoogleStrategy
	fastify.get('/auth/google/logout', async (request, reply) => {
		console.log("User should appear: ", request.user.username)
		request.logout((err) => {
			if (err) {
				return reply.status(500).send({ message: 'Logout error' });
			}
		});
		console.log("User should not appear: ", request.user.username)
	})
}
