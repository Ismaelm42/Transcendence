import { mergeDefaults } from 'sequelize/lib/utils';
import db from '../database/models/index.cjs';
import { Op } from 'sequelize';
const { Friend } = db;

export const createFriendEntry = async (userId, friendId, status) => {
	try {
		const friend = await Friend.create({ userId, friendId, status });
		return friend;
	} catch (err) {
		throw new Error(`Error creating friend entry: ${err.message}`);
	}
};

export const deleteFriendEntry = async (userId, friendId) => {
	try {
		const friend = await Friend.findOne({
			where: {
				[Op.or]: [
					{ userId: userId, friendId: friendId },
					{ userId: friendId, friendId: userId }
				]
			}
		});
		if (friend) {
			if (friend.status === 'pending' || friend.status === 'accepted') {
				await friend.destroy();
				return { message: `Relationship between ${userId} and ${friendId} deleted successfully` };
			}
			else if (friend.status === 'blocked') {
				throw new Error(`Unable to delete relationship between user ${userId} and ${friendId} because there is a block`);;
			}
		} else {
			throw new Error(`Relationship between ${userId} and ${friendId} not found`);
		}
	} catch (err) {
		throw new Error(`Error deleting friend entry: ${err.message}`);
	}
};

export const updateFriendStatus = async (userId, friendId, status) => {
	try {
		const friend = await Friend.findOne({
			where: {
				[Op.or]: [
					{ userId: userId, friendId: friendId },
					{ userId: friendId, friendId: userId }
				]
			}
		});
		if (friend) {
			if (status === 'accepted') {
				if (friend.friendId !== userId) {
					throw new Error(`User ${userId} is not the friendId of the relationship`);
				}
				friend.status = status;
				friend.wasFriend = true;
				await friend.save();
			}
			else if (status === 'blocked') {
				if (friend.status === 'blocked') {
					throw new Error(`User ${userId} already blocked user ${friendId}`);
				}
				friend.status = status;
				friend.userId = userId;
				friend.friendId = friendId;
				await friend.save();
			}
			else if (status === 'unblocked' && friend.userId === userId && friend.status === 'blocked') {
				if (friend.wasFriend) {
					friend.status = 'accepted';
					await friend.save();
				}
				else {
					deleteFriendEntry(userId, friendId);
				}
			}
			else
				throw new Error(`Invalid status: ${status}`);
			return friend;
		} else {
			throw new Error(`Relationship between ${userId} and ${friendId} not found`);
		}
	} catch (err) {
		throw new Error(`Error updating friend status: ${err.message}`);
	}
};

export const getAllFriendsEntriesFromUser = async (userId, status) => {
	try {
		const queryConditions = {
			[Op.or]: [
				{ userId: userId },
				{ friendId: userId }
			]
		};
		if (status !== null && status !== undefined) {
			queryConditions.status = status;
		}
		const friends = await Friend.findAll({ where: queryConditions });
		return friends;
	} catch (err) {
		throw new Error(`Error fetching ${status} friends: ${err.message}`);
	}
};

export const getAllFriendsEntries = async () => {
	try {
		const friends = await Friend.findAll({});
		return friends;
	} catch (err) {
		throw new Error(`Error fetching friends: ${err.message}`);
	}
};

export const getFriendStatus = async (userId, friendId) => {
	try {
		const friend = await Friend.findOne({
			where: {
				[Op.or]: [
					{ userId: userId, friendId: friendId },
					{ userId: friendId, friendId: userId }
				]
			}
		});
		if (friend) {
			return friend.status;
		} else {
			return ('none');
		}
	} catch (err) {
		throw new Error(`Error fetching status: ${err.message}`);
	}
}

export const getFriendRole = async (userId, friendId) => {
	try {
		let friend = await Friend.findOne({
			where: {
				userId: userId, friendId: friendId
			}
		});
		if (friend) {
			return "passive";
		}
		else {
			friend = await Friend.findOne({
				where: {
					userId: friendId, friendId: userId
				}
			});
			if (friend) {
				return "active";
			} else {
				return ('none');
			}
		}
	} catch (err) {
		throw new Error(`Error fetching role: ${err.message}`);
	}
}
