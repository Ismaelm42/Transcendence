import { crud } from '../crud/crud.js';
import { extractUserFromToken } from '../auth/authToken.js';

export function configureFriendRoutes(fastify) {

	// Define a POST route to send a friend request to an user
	fastify.post('/send_friend_request', async (request, reply) => {
		const user = await extractUserFromToken(request.cookies.token);
		if (!user)
			return reply.code(401).send({ error: 'Unauthenticated user' });
		const userId = user.id;
		const { friendId } = request.body;
		console.log('friendId = ', friendId);
		try {
			const newFriend = await crud.friend.createFriendEntry(userId, friendId);
			reply.status(200).send(newFriend);
		} catch (err) {
			fastify.log.error(err);
			reply.status(400).send({ error: 'Error sending friend request: ' + err.message });
		}
	});

	// Define a POST route to accept a friend request
	fastify.post('/accept_friend_request', async (request, reply) => {
		const user = await extractUserFromToken(request.cookies.token);
		if (!user)
			return reply.code(401).send({ error: 'Unauthenticated user' });
		const userId = user.id;
		const { friendId } = request.body;
		try {
			const newFriend = await crud.friend.updateFriendStatus(userId, friendId, 'accepted');
			reply.status(200).send(newFriend);
		} catch (err) {
			fastify.log.error(err);
			reply.status(400).send({ error: 'Error accepting friend request: ' + err.message });
		}
	});

	// Define a POST route to reject a friend request (erase the relationship in the database)
	fastify.post('/reject_friend_request', async (request, reply) => {
		const user = await extractUserFromToken(request.cookies.token);
		if (!user)
			return reply.code(401).send({ error: 'Unauthenticated user' });
		const userId = user.id;
		const { friendId } = request.body;
		try {
			const updatedFriend = await crud.friend.deleteFriendEntry(userId, friendId);
			reply.status(200).send(updatedFriend);
		} catch (err) {
			fastify.log.error(err);
			reply.status(400).send({ error: 'Error rejecting friend request: ' + err.message });
		}
	});

	// Define a POST route to block an user
	fastify.post('/block_user', async (request, reply) => {
		const user = await extractUserFromToken(request.cookies.token);
		if (!user)
			return reply.code(401).send({ error: 'Unauthenticated user' });
		const userId = user.id;
		const { friendId } = request.body;
		try {
			const updatedFriend = await crud.friend.updateFriendStatus(userId, friendId, 'blocked');
			reply.status(200).send(updatedFriend);
		} catch (err) {
			fastify.log.error(err);
			reply.status(400).send({ error: 'Error blocking user: ' + err.message });
		}
	});

	// Define a POST route to unblock an user (erase the relationship in the database)
	fastify.post('/unblock_user', async (request, reply) => {
		const user = await extractUserFromToken(request.cookies.token);
		if (!user)
			return reply.code(401).send({ error: 'Unauthenticated user' });
		const userId = user.id;
		const { friendId } = request.body;
		try {
			const updatedFriend = await crud.friend.deleteFriendEntry(userId, friendId);
			reply.status(200).send(updatedFriend);
		} catch (err) {
			fastify.log.error(err);
			reply.status(400).send({ error: 'Error rejecting friend request: ' + err.message });
		}
	});

	// Define a POST route to retrieve all friends status (pending, accepted and blocked) from an user
	fastify.post('/get_all_friends_entries_from_an_id', async (request, reply) => {
		const user = await extractUserFromToken(request.cookies.token);
		if (!user)
			return reply.code(401).send({ error: 'Unauthenticated user' });
		const userId = user.id;
		try {
			const updatedFriend = await crud.friend.getAllFriendsEntriesFromUser(userId, null);
			reply.status(200).send(updatedFriend);
		} catch (err) {
			fastify.log.error(err);
			reply.status(400).send({ error: 'Error rejecting friend request: ' + err.message });
		}
	});

	// Define a POST route to retrieve all pending users from an user
	fastify.post('/get_all_pending_users_from_an_id', async (request, reply) => {
		const user = await extractUserFromToken(request.cookies.token);
		if (!user)
			return reply.code(401).send({ error: 'Unauthenticated user' });
		const userId = user.id;
		try {
			const updatedFriend = await crud.friend.getAllFriendsEntriesFromUser(userId, 'pending');
			reply.status(200).send(updatedFriend);
		} catch (err) {
			fastify.log.error(err);
			reply.status(400).send({ error: 'Error rejecting friend request: ' + err.message });
		}
	});

	// Define a POST route to retrieve all accepted users from an user
	fastify.post('/get_all_accepted_users_from_an_id', async (request, reply) => {
		const user = await extractUserFromToken(request.cookies.token);
		if (!user)
			return reply.code(401).send({ error: 'Unauthenticated user' });
		const userId = user.id;
		try {
			const updatedFriend = await crud.friend.getAllFriendsEntriesFromUser(userId, 'accepted');
			reply.status(200).send(updatedFriend);
		} catch (err) {
			fastify.log.error(err);
			reply.status(400).send({ error: 'Error rejecting friend request: ' + err.message });
		}
	});

	// Define a POST route to retrieve all blocked users from an user
	fastify.post('/get_all_blocked_users_from_an_id', async (request, reply) => {
		const user = await extractUserFromToken(request.cookies.token);
		if (!user)
			return reply.code(401).send({ error: 'Unauthenticated user' });
		const userId = user.id;
		try {
			const updatedFriend = await crud.friend.getAllFriendsEntriesFromUser(userId, 'blocked');
			reply.status(200).send(updatedFriend);
		} catch (err) {
			fastify.log.error(err);
			reply.status(400).send({ error: 'Error rejecting friend request: ' + err.message });
		}
	});

	// Define a GET route to retrieve all friends status (pending, accepted and blocked) from all users
	fastify.get('/get_all_friends_entries', async (request, reply) => {
		try {
			const friends = await crud.friend.getAllFriendsEntries();
			reply.status(200).send(friends);
		} catch (err) {
			fastify.log.error(err);
			reply.status(500).send({ error: 'Error fetching all friends from all users' + err });
		}
	});
}
