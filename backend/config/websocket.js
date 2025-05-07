import fastifyWebsocket from '@fastify/websocket';

export function registerWebsocket(fastify) {

	// Register Fastify Websocket
	fastify.register(fastifyWebsocket);
}
