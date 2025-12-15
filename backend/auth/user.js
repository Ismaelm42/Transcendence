import fs from 'fs/promises';import path from 'path';
import fetch from 'node-fetch';
import fastifyPassport from "@fastify/passport";
import GoogleStrategy from "passport-google-oauth20";
import { crud } from '../crud/crud.js';
import { comparePassword } from '../database/users/PassUtils.cjs';
import { setTokenCookie, destroyTokenCookie } from "./token.js";
import { isUserOnline } from "../websockets/online/onlineUsers.js";

export async function authenticateUser(email, password, reply) {

	// Check if user exists and return it
	const user = await crud.user.getUserByEmail(email);
	if (!user)
		return reply.status(401).send({ message: 'Wrong email' });
	const isMatch = await comparePassword(password, user.password);
	if (!isMatch)
		return reply.status(401).send({ message: 'Wrong password' });

	if (isUserOnline(user.id)) {
		return reply.status(403).send({ message: 'User already logged in from another location' });
	}

	setTokenCookie(user.id, reply);
	await crud.user.updateLastLoginById(user.id);
	return reply.status(200).send({
		user: user
	});
};

async function checkUsernameAvailability(googleDisplayName, attempt = 0) {

	// Check if username is available and create a new one if not
	const username = attempt === 0 ? googleDisplayName : googleDisplayName + attempt;
	try {
		const user = await crud.user.getUserByName(username);
		if (user) {
			return await checkUsernameAvailability(googleDisplayName, attempt + 1);
		}
		else {
			return username;
		}
	} catch (err) {
		throw new Error(`Error checking username: ${err.message}`);
	}
}

async function saveImageInDatabase(googleImagePath, user) {

	// Save the googleImage in database
	const response = await fetch(googleImagePath);
	if (response.ok) {
		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		const dbImagePath = path.join(`/app/images/${user.id}.png`);
		await fs.writeFile(dbImagePath, buffer);
		crud.user.updateUserbyId(user.id, null, null, null, null, null, `/back/images/${user.id}.png`);
	}
}

export function authenticateUserWithGoogleStrategy() {

	// Use Google Strategy to authenticate user
	fastifyPassport.use(new GoogleStrategy({
		clientID: process.env.GOOGLE_CLIENT_ID,
		clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		callbackURL: process.env.GOOGLE_CALLBACK_URL,
		scope: ['profile', 'email']
	}, async function (googleAccessToken, googleRefreshToken, profile, cb) {
		try {
			let user = await crud.user.getUserByGoogleId(profile.id);
			if (user) {
				await crud.user.updateLastLoginById(user.id);
			}
			if (!user) {
				user = await crud.user.getUserByEmail(profile.emails[0].value);
				if (user) {
					await crud.user.updateLastLoginById(user.id);
					user.googleId = profile.id;
				}
				else {
					const googleDisplayName = profile.displayName.trim().replace(/\s+/g, '_');
					const username = await checkUsernameAvailability(googleDisplayName);
					user = await crud.user.createUser(username, null, profile.id, profile.emails?.[0]?.value || null, profile.photos?.[0]?.value || null);
					if (profile.photos?.[0]?.value) {
						saveImageInDatabase(profile.photos[0].value, user);
					}
				}
			}
			cb(null, user);
		}
		catch (err) {
			// Log full error for debugging OAuth2 token exchange issues
			try {
				console.error('Google strategy error:', err && err.toString ? err.toString() : err);
				// some oauth libs attach response body/data
				if (err && err.data) console.error('Google error data:', err.data);
				if (err && err.statusCode) console.error('Google error statusCode:', err.statusCode);
			} catch (logErr) {
				console.error('Error logging google strategy error', logErr);
			}
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
	await crud.user.updateLastLogoutById(user.id);
	destroyTokenCookie(reply);
	return reply.status(200).send({ message: 'Logged out successfully' });
}
