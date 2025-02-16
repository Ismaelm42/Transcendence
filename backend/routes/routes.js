import fastifyPassport from "@fastify/passport";

export default function configureRoutes(fastify) {

	// Define a route for /
	fastify.get('/', async (request, reply) => {
		if (request.user && request.user.displayName)
			return reply.send(`Welcome ${request.user.displayName}`);
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
		preValidation: fastifyPassport.authenticate('google', { scope: ['profile'] })
	},
		async (request, reply) => {
			reply.redirect('/back');
		}
	);

	// Define a route to handle google logout (It doesn't work check case logout and then re-login with google. It automatically logs in and showsa the user name again)
	fastify.get('/auth/google/logout', async (request, reply) => {
		request.logout();
		reply.redirect('/back');
	})
}
