import Fastify from "fastify";
import { configureServer, configureGoogleAuth } from './config/config.js';
import configureRoutes from './routes/routes.js';

const fastify = Fastify();

configureServer(fastify);
configureGoogleAuth(fastify);
configureRoutes(fastify);

// Initialize Server
const start = async () => {
  try {
    await fastify.listen({ port: 8000, host: '0.0.0.0' });
    console.log('Server listenning on http://backend:8000');
  }
  catch (err) {
    console.log(err);
    process.exit(1);
  }
}

// Call the function to start server
start();
