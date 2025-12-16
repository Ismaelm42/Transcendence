import Fastify from "fastify";
import pinoConfig from "./config/pino.js";
import { configureServer } from './config/config.js';
import configureRoutes from './routes/routes.js';
import { runMigrations, runSeeders } from './utils/migrationUtils.js';
import pkg from './database/models/index.cjs';
const { sequelize } = pkg;

const fastify = Fastify({ logger: pinoConfig});

configureServer(fastify);
configureRoutes(fastify, sequelize);

// Initialize Server
const start = async () => {
	try {
		// Sync the database
		await sequelize.sync();
		await runMigrations();
		await runSeeders(sequelize);

		await fastify.listen({ port: 8000, host: '0.0.0.0' });
	}
	catch (err) {
		fastify.log.info(err);
		process.exit(1);
	}
}

// Call the function to start server
start();
