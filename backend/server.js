'use strict';

import fastify from 'fastify';
import { sequelize } from './models/index.js'; // Importa sequelize y los modelos
import pino from 'pino';
import db from './models/index.js'; // Importa el objeto db por defecto

const { User, Stat } = db;

const app = fastify({ logger: true });

const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true
        }
    }
});

app.post('/create_user/', async (request, reply) => {
	const username = request.body['user'];
	const password = request.body['password'];
	try {
		const newUser = await User.create({ username, password });
		console.log(`User ${username} created`);
		return { message: `User ${username} created successfully` };
	} catch (err) {
		app.log.error(err);
		return { error: 'Error creating user' };
	}
});

app.get('/get_users/', async (request, reply) => {
    try {
        const users = await User.findAll();
        return users;
    } catch (err) {
        app.log.error('Cannot list users', err);
        return { error: 'Error fetching users' };
    }
});

app.delete('/delete_user/', async (request, reply) => {
	const username = request.body['user'];
	try {
		const user = await User.findOne({ where: { username } });
		if (user) {
			await user.destroy();
			return { message: `User ${username} deleted successfully` };
		} else {
			return { error: `User ${username} not found` };
		}
	} catch (err) {	
		app.log.error(err);
		return { error: 'Error deleting user' };
	}
});


app.delete('/delete_user_by_id/', async (request, reply) => {
	const userId = request.body['id'];
	try {
		const user = await User.findByPk(userId);
		if (user) {
			await user.destroy();
			return { message: `User with ID ${userId} deleted successfully` };
		} else {
			return { error: `User with ID ${userId} not found` };
		}
	} catch (err) {	
		app.log.error(err);
		return { error: 'Error deleting user' };
	}
});

app.get('/about/', async (request, reply) => {
    app.log.info(request.query.user);
    return { hello: 'about' };
});

app.get('/', async (request, reply) => {
    app.log.info(request.query.user);
    return { hello: 'WTF!' };
});

// Initialize Server
const start = async () => {
    try {
        // Sync the database
        await sequelize.sync();
        console.log('Database synced');

        // Listen on port 8000
        await app.listen({ port: 8000, host: '0.0.0.0' });
        app.log.info(`Server listening on http://localhost:8000`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

// Call the function to start server
start();