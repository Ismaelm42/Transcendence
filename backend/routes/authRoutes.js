import fastifyPassport from "@fastify/passport";
import { authenticateUser, signOutUser, signOutUserWithGoogleStrategy } from "../auth/authUser.js";
import { setTokenCookie } from "../auth/authToken.js";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export function configureAuthRoutes(fastify, sequelize) {

	// Define a POST route to authenticate an user
	fastify.post('/auth/login', async (request, reply) => {
		fastify.log.info({ body: request.body }, 'login data sent');
		const { email, password } = request.body;
		return authenticateUser(email, password, reply);
	});

	// // Define a POST route to logout an user
	// fastify.post('/auth/logout', async (request, reply) => {
	// 	fastify.log.info({ body: request.body }, 'logout data sent');
	// 	fastify.log.info('Logging out');
	// 	fastify.log.info(request.body);
	// 	const { username } = request.body;
	// 	signOutUser(username, reply);
	// });




	fastify.post('/auth/logout', async (request, reply) => {
		try {
			// Obtener la cookie `token` (asegúrate de que Fastify soporta cookies con el plugin `fastify-cookie`)
			const token = request.cookies.token;
			fastify.log.info('Logging out');
			fastify.log.info(token);
			if (!token) {
				fastify.log.warn('No token found in cookies.');
				return reply.status(401).send({ error: 'Unauthorized' });
			}
	
			// Verificar y decodificar el token JWT para obtener el username
			const decoded = jwt.verify(token, JWT_SECRET);
			console.log (decoded);
			if (!decoded || !decoded.username) {
				fastify.log.warn('Invalid token.');
				return reply.status(401).send({ error: 'Invalid token' });
			}
	
			const username = decoded.username;
			fastify.log.info(`Logging out user: ${username}`);
	
			// Llamar a signOutUser con el username obtenido del token
			signOutUser(username, reply);
	
			// Eliminar la cookie de sesión
			reply
				.clearCookie('token', {
					httpOnly: true,
					secure: true,
					sameSite: 'Strict',
					path: '/',
				})
				.send({ message: 'Logged out successfully' });
	
		} catch (error) {
			fastify.log.error('Logout error:', error);
			reply.status(500).send({ error: 'Internal Server Error' });
		}
	});
	




	// Define a GET route to authenticate an user with GoogleStrategy
	fastify.get('/auth/google/login', {
		preValidation: fastifyPassport.authenticate('google', { scope: ['profile', 'email'] })
	},
		async (request, reply) => {
			setTokenCookie(request.user.username, reply);
			reply.redirect('https://localhost:8443/#home');
		}
	);

	// Define a GET route to logout an user with GoogleStrategy
	fastify.get('/auth/google/logout', async (request, reply) => {
		signOutUserWithGoogleStrategy(request.user.username, reply);
	})
	
	// Ruta para verificar si el token es válido 
	// todo : ver si se puede reutilizar la función de authToken.js
	fastify.get('/auth/verify-token', async (request, reply) => {
		console.log('Verificando token: ');
		// console.log(request.cookies);
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
