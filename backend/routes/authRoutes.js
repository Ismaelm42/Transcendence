import fastifyPassport from "@fastify/passport";
import { authenticateUser, signOutUser } from "../auth/authUser.js";
import { extractUserFromToken, setTokenCookie } from "../auth/authToken.js";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export function configureAuthRoutes(fastify, sequelize) {

	// Define a POST route to authenticate an user
	fastify.post('/auth/login', async (request, reply) => {
		fastify.log.info({ body: request.body }, 'login data sent');
		const { email, password } = request.body;
		return authenticateUser(email, password, reply);
	});

	// Define a GET route to authenticate an user with GoogleStrategy
	fastify.get('/auth/google/login', {
		preValidation: fastifyPassport.authenticate('google', { scope: ['profile', 'email'] })
	},
		async (request, reply) => {
			setTokenCookie(request.user.username, reply);
			reply.redirect('https://localhost:8443/#home');		}
	);

	// Define a POST route to logout an user
	fastify.post('/auth/logout', async (request, reply) => {
		const token = request.cookies.token
		const user = await extractUserFromToken(token, reply);
		await signOutUser(token, user, reply);
	});

	fastify.get('/auth/verify-token', async (request, reply) => {
		console.log('Verificando token');
		console.log(request.cookies.token);
	    try {
	        const token = request.cookies.token;
	        if (!token) {
	            return reply.status(401).send({ message: 'Token no incluido' });
	        }
	        // Verificar el token
	        const decoded = jwt.verify(token, JWT_SECRET);
	        reply.send({ valid: true, user: decoded });
	    } catch (error) {
	        reply.status(401).send({ valid: false, message: 'Token inválido o expirado' });
	    }
	});
}
