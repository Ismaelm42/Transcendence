import fastifyCors from "@fastify/cors";

export function configureCors(fastify) {

	// Register CORS
	fastify.register(fastifyCors, {
		origin: "*",
		methods: ["GET", "POST", "PUT", "DELETE"],
		allowedHeaders: ['Content-Type'],
	});
}
