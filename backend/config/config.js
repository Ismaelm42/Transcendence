import fastifyCors from "@fastify/cors";
import fastifyPassport from "@fastify/passport";
import GoogleStrategy from "passport-google-oauth20";
import fastifySecureSession from "@fastify/secure-session";

export function configureServer(fastify) {

	// Register CORS
	fastify.register(fastifyCors, {
		origin: "*",
		methods: ["GET", "POST", "PUT", "DELETE"],
		allowedHeaders: ['Content-Type'],
	});
}

export function configureGoogleAuth(fastify) {

	// Register Fastify Secure Session
	fastify.register(fastifySecureSession, {
		secret: process.env.SESSION_SECRET,
		cookie: {
			path: '/'
		}
	})

	// Initialize Fastify Passport
	fastify.register(fastifyPassport.initialize());
	fastify.register(fastifyPassport.secureSession());

	// Use Google Strategy
	fastifyPassport.use(new GoogleStrategy({
		clientID: process.env.GOOGLE_CLIENT_ID,
		clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		callbackURL: "https://localhost:8443/back/auth/google/login"
	}, function (accessToken, refreshToken, profile, cb) {
	// We should store the user profile in the database
		cb(null, profile);
	}));

	// Define a serializer
	fastifyPassport.registerUserSerializer(async (user, request) => {
		return user;
	})

	// Define a deserializer
	fastifyPassport.registerUserDeserializer(async (user, request) => {
		return user;
	})

}
