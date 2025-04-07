import { configureCors } from './cors.js';
import { configureGoogleAuth } from './googleAuth.js';
import { configureStaticFiles } from './staticFiles.js';


export function configureServer(fastify) {

	// configureDevTools(fastify);
	configureStaticFiles(fastify);
	configureCors(fastify);
	configureGoogleAuth(fastify);
}
