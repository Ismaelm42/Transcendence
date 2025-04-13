import fastifyPassport from "@fastify/passport";
import { authenticateUser, signOutUser } from "../auth/authUser.js";
import { extractUserFromToken, setTokenCookie } from "../auth/authToken.js";
import { getUserById , updateUserbyId} from "../database/crud.cjs";
import { comparePassword } from '../database/users/PassUtils.cjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export function configureAuthRoutes(fastify, sequelize) {

	// Define a POST route to authenticate an user
	fastify.post('/auth/login', async (request, reply) => {
		fastify.log.info({ body: request.body }, 'login data sent');
		const { email, password } = request.body;
		return authenticateUser( email, password, reply);
	});

	// Define a GET route to authenticate an user with GoogleStrategy
	fastify.get('/auth/google/login', {
		preValidation: fastifyPassport.authenticate('google', { scope: ['profile', 'email'] })
	},
		async (request, reply) => {
			setTokenCookie(request.user.id, reply);
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
	        const decodedId = jwt.verify(token, JWT_SECRET);
			const decoded = await getUserById(decodedId.userId);
	        reply.send({ valid: true, user: decoded });
	    } catch (error) {
	        reply.status(401).send({ valid: false, message: 'Invalid or expired Token' });
	    }
	});

	fastify.post('/change_password', async (request, reply) => {
		// fastify.log.info({ body: request.body }, 'change_password data sent');
		const { currentPassword, newPassword, confirmPassword } = request.body;
		try {
			const token = request.cookies.token;
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			const userId = decoded.userId;
			const user = await getUserById(userId);
			if (!user) {
				return reply.status(401).send({ message: 'User not found' });
			}
			const isMatch = await comparePassword(currentPassword, user.password);
			if (!isMatch)
				return reply.status(401).send({ message: 'Wrong current password' });
			if (newPassword !== confirmPassword) {	// No es estrictamente necesario, ya que se hace desde el front.
				return reply.status(401).send({ message: 'Passwords are not identical' });
			}
			const username = user.username;
			const password = newPassword;
			const updatedUser = await updateUserbyId(userId, username, password);
			reply.send({message: `User ${username} updated successfully`});
		} catch (err) {
			fastify.log.error(err);
			reply.status(500).send({ error: 'Error changing password: ' + err.message });
		}
	});	
}
