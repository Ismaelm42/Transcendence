import fastify from 'fastify';
import jwt from 'jsonwebtoken';
import { getUserById } from "../database/crud.cjs";


const JWT_SECRET = process.env.JWT_SECRET;

export function setTokenCookie(userId, reply) {

    // Set accessToken cookie with username
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
    reply.setCookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
        maxAge: 3600,
    });
}

// // modificada para usar el token de la cookie_ AFZ
// export function verifyToken (request, reply, done) {
// 	try {
// 		console.info('Verifying token ' , request.cookies.token);
// 		const token = request.cookies.token;
// 		if (!token) {
// 			return reply.status(401).send({ message: 'Token no incluidotrutru' });
// 		}
// 		const decoded = jwt.verify(token, JWT_SECRET);
// 		reply.send({ valid: true, user: decoded });
// 	} catch (error) {
// 		reply.status(401).send({ valid: false, message: 'Token inválido o expirado' });
// 	}
//     done();
// };

export function verifyToken (request, reply, done) {
	try {
		const token = request.cookies.token;
		if (!token) {
			reply.status(401).send({ message: 'Token no incluido' });
			return; // Cortamos la ejecución si no hay token
		}
		request.userId = jwt.verify(token, process.env.JWT_SECRET);
		done(); // Continuar con la ejecución de la ruta protegida
	} catch (error) {
		reply.status(401).send({ valid: false, message: 'Token inválido o expirado' });
	}
};

export async function extractUserFromToken(token) {
    try {
        if (!token) {
            console.log('No token provided.');
            return null;
        }
        const decodedId = jwt.verify(token, JWT_SECRET);
		const decodedUser = await getUserById(decodedId.userId);
        if (!decodedUser || !decodedUser.username) {
            console.log('Invalid or missing username in getUserById.');
            return null;
        }
        const username = decodedUser.username;
        return decodedUser;
    } catch (error) {
        console.error('Error verifying token:', error);
        return null;
    }
}

export function destroyTokenCookie(reply) {
    
    // Destroy accessToken cookie
    reply.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
    });
}
