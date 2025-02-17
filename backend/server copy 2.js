'use strict';

const fastify = require('fastify')({ logger: true });
const { sequelize, User, Stat } = require('./models'); // Importa sequelize y los modelos

const pino = require('pino');
const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true
        }
    }
});

fastify.get('/create_user/', async (request, reply) => {
    const user = request.query.username;
    const pass  = request.query.password;
    try {
        const newUser = await User.create({ username: user, password: pass });
        console.log(`User ${user} created`);
        return { message: `User ${user} created successfully` };
    } catch (err) {
        fastify.log.error(err);
        return { error: 'Error creating user' };
    }
});

fastify.get('/get_users/', async (request, reply) => {
	try {
		const users = await User.findAll();
		return users;
	} catch (err) {
		fastify.log.error('Cannot list users', err);
		return { error: 'Error fetching users' };
	}
});

fastify.get('/about/', async (request, reply) => {
    fastify.log.info(request.query.user);
    return { hello: 'about' };
});

fastify.get('/', async (request, reply) => {
    fastify.log.info(request.query.user);
    return { hello: 'WTF!' };
});

// Initialize Server
const start = async () => {
    try {
        // Sync the database
        await sequelize.sync();
        console.log('Database synced');

        // Listen on port 8000
        await fastify.listen({ port: 8000, host: '0.0.0.0' });
        fastify.log.info(`Server listening on http://localhost:8000`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

// Call the function to start server
start();