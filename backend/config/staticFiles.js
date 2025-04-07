import fastifyStatic from "@fastify/static";
import fastifyMultipart from "@fastify/multipart";

export function configureStaticFiles(fastify) {

	// Register Fastify Multipart
	fastify.register(fastifyMultipart);

	//Register Fastify Static
	fastify.register(fastifyStatic, {
		root: "/app/images",
		prefix: "/images/",
	  });
}
