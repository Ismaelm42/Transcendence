import fastifyPassport from "@fastify/passport";
import { authenticateUser, signOutUser, signOutUserWithGoogleStrategy } from "../auth/authUser.js";
import { setTokenCookie } from "../auth/authToken.js";

export function configureAuthRoutes(fastify, sequelize) {

	// Define a POST route to authenticate an user
	fastify.post('/auth/login', async (request, reply) => {
		fastify.log.info({ body: request.body }, 'login data sent');
		const { email, password } = request.body;
		return authenticateUser(email, password, reply);
	});

	// Define a POST route to logout an user
	fastify.post('/auth/logout', async (request, reply) => {
		fastify.log.info({ body: request.body }, 'logout data sent');
		const { email } = request.body;
		signOutUser(reply);
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
		signOutUserWithGoogleStrategy(request, reply, sequelize);
	})
}
