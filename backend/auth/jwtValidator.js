import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const verifyToken = (request, reply, done) => {

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
