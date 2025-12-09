import jwt from 'jsonwebtoken';
import { crud } from '../crud/crud.js';

const JWT_SECRET = process.env.JWT_SECRET;

export function setTokenCookie(userId, reply) {

    // Set accessToken cookie with username
    // const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '60s' });
    // const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });

    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '4h' });

    reply.setCookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
		maxAge: 4 * 60 * 60, 
		// maxAge: 1 * 60,
		// maxAge: 3600,
    });
}

export function verifyToken (request, reply, done) {

    // Verify accessToken cookie
	try {
		const token = request.cookies.token;
		if (!token) {
			reply.status(401).send({ message: 'Token no incluido' });
			return;
		}
		request.userId = jwt.verify(token, process.env.JWT_SECRET);
		done();
	} catch (error) {
		reply.status(401).send({ valid: false, message: 'Token inválido o expirado' });
	}
};


export async function extractUserFromToken(token) {

    // Extract user from token
    try {
        if (!token) {
            return null;
        }
        const decodedId = jwt.verify(token, JWT_SECRET);
		const decodedUser = await crud.user.getUserById(decodedId.userId);
        if (!decodedUser || !decodedUser.username) {
            return null;
        }
        return decodedUser;
    } catch (error) {
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
