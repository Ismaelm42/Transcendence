import jwt from 'jsonwebtoken';
import { getUserByName } from "../database/crud.cjs";

const JWT_SECRET = process.env.JWT_SECRET;

export function setTokenCookie(username, reply) {

    // Set accessToken cookie with username
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
    reply.setCookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
        maxAge: 3600,
    });
}

export function verifyToken (request, reply, done) {

    // Get token from headers and verify it
    const authHeader = request.headers['authorization'];
    if (!authHeader)
        return reply.status(401).send({ message: 'Token not found' });
    const token = authHeader.split(' ')[1];
    if (!token)
        return reply.status(401).send({ message: 'Token not found' });
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err)
            return reply.status(401).send({ message: 'Token not valid' });
        request.user = decoded;
        done();
    });
};

export async function extractUserFromToken(token) {

    // Extract user from token
    try {
        if (!token) {
            console.log('No token provided.');
            return null;
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded || !decoded.username) {
            console.log('Invalid or missing username in token.');
            return null;
        }
        const username = decoded.username;
        const user = await getUserByName(username);
        return user;
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
