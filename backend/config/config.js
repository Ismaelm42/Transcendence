import fastifyCors from "@fastify/cors";
import fastifyPassport from "@fastify/passport";
import GoogleStrategy from "passport-google-oauth20";
import fastifySecureSession from "@fastify/secure-session";
import { createUser, getUserById, updateUserbyId, getUserByName, getUserByEmail, getUserByGoogleId, getUsers, deleteUserById, deleteAllUsers } from "../database/crud.cjs";
import jwt from 'jsonwebtoken';

export function configureServer(fastify) {

	// Register CORS
	fastify.register(fastifyCors, {
		origin: "*",
		methods: ["GET", "POST", "PUT", "DELETE"],
		allowedHeaders: ['Content-Type'],
	});
}

export function configureGoogleAuth(fastify, reply) {

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
		callbackURL: "https://localhost:8443/back/auth/google/login",
		scope: ['profile', 'email']
	}, async function (accessToken, refreshToken, profile, cb) {
        try {
			// // Get JWT secret
			// const JWT_SECRET = process.env.JWT_SECRET;
            // Search for the user in the database
            let user = await getUserByGoogleId(profile.id);
            // If user does not exist, create a new user
			if (!user){
				user = await getUserByEmail(profile.emails[0].value);
			if (user) {
				user.googleId = profile.id;
			}
			else {
				user = await createUser(profile.displayName, null, profile.emails[0].value);
				user.googleId = profile.id;
				user.avatarPath = profile.photos?.[0]?.value || null;
			}
			await user.save();
				// // Create a JWT token
			// const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });
			
			// // Establecer el token como una cookie HTTP-only y secure
			// reply.setCookie('token', "melocotonenAlmibar", {
			// 	httpOnly: true,
			// 	secure: true, // Asegúrate de que tu servidor esté configurado para HTTPS
			// 	sameSite: 'strict', // Opcional: evita que la cookie sea enviada en solicitudes de terceros
			// 	path: '/', // La cookie estará disponible en toda la aplicación
			// 	maxAge: 3600 // Tiempo de expiración en segundos (1 hora)
			// 	});

			 }
            cb(null, user);
        } catch (err) {
            cb(err);
        }
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
