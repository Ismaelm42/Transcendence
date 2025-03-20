import fastifyPassport from "@fastify/passport";
import GoogleStrategy from "passport-google-oauth20";
import { comparePassword } from '../database/users/PassUtils.cjs';
import { createUser, getUserByEmail, getUserByGoogleId } from "../database/crud.cjs";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticateUser = async (email, password, reply) => {

	// Check if user exists and return it
	const user = await getUserByEmail(email);
	console.log('Searching user:', email);
	if (!user)
		return reply.status(401).send({ message: 'Wrong username' });
	console.log(password);
	console.log(user.password);
	const isMatch = await comparePassword(password, user.password);
	if (!isMatch)
		return reply.status(401).send({ message: 'Wrong password' });
	const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });

	reply.setCookie('token', token, {
		httpOnly: true,
		secure: true,
		sameSite: 'strict',
		path: '/',
		maxAge: 3600
	});
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
	}, async function (accessToken, refreshToken, profile, cb) {
		try {
			let user = await getUserByGoogleId(profile.id);
			if (!user) {
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
			}
			cb(null, user);
		}
		catch (err) {
			cb(err);
		}
	}));
}
