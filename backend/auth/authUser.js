import fastifyPassport from "@fastify/passport";
import GoogleStrategy from "passport-google-oauth20";
import { comparePassword } from '../database/users/PassUtils.cjs';
import { createUser, getUserByEmail, getUserByGoogleId, updateLastLoginById, updateLastLogoutById } from "../database/crud.cjs";
import { setTokenCookie, destroyTokenCookie } from "./authToken.js";

const JWT_SECRET = process.env.JWT_SECRET;

export async function authenticateUser(email, password, reply) {

	// Check if user exists and return it
	const user = await getUserByEmail(email);
	if (!user)
		return reply.status(401).send({ message: 'Wrong email' });
	const isMatch = await comparePassword(password, user.password);
	if (!isMatch)
		return reply.status(401).send({ message: 'Wrong password' });
	setTokenCookie(user.username, reply);
	updateLastLoginById(user.id);
	return reply.status(200).send({
		user: user
	});
};

export function authenticateUserWithGoogleStrategy() {

	// Use Google Strategy to authenticate user
	fastifyPassport.use(new GoogleStrategy({
		clientID: process.env.GOOGLE_CLIENT_ID,
		clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		callbackURL: "https://localhost:8443/back/auth/google/login",
		scope: ['profile', 'email']
	}, async function (googleAccessToken, googleRefreshToken, profile, cb) {
		try {
			let user = await getUserByGoogleId(profile.id);
			if (user) {
				updateLastLoginById(user.id);
			}
			if (!user) {
				user = await getUserByEmail(profile.emails[0].value);
				if (user) {
					updateLastLoginById(user.id);
					user.googleId = profile.id;
				}
				else {
					user = await createUser(profile.displayName + "_" + profile.id, null, profile.id, profile.emails?.[0]?.value || null, profile.photos?.[0]?.value || null);
				}
			}
			cb(null, user);
		}
		catch (err) {
			cb(err);
		}
	}));
}

export async function signOutUser(token, user, reply) {

	// Sign out user updating lastLogout and destroying token
	if (!token)
		return reply.status(401).send({ message: 'Token not found' });
	if (!user)
		return reply.status(401).send({ message: 'Invalid token' });
	await updateLastLogoutById(user.id);
	destroyTokenCookie(reply);
	return reply.status(200).send({ message: 'Logged out successfully' });
}
