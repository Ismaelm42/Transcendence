import { configureCors } from './cors.js';
import { configureGoogleAuth } from './googleAuth.js';

export function configureServer(fastify) {

	configureCors(fastify);
	configureGoogleAuth(fastify);
}
