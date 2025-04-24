const db = require('../database/models/index.cjs');
const { hashPassword } = require('../database/users/PassUtils.cjs');
const { Op } = require('sequelize');
const { User, Gamelog, Friend } = db;

const createFriendEntry = async (userId, friendId) => {
	try {
		const friend = await Friend.create({ userId, friendId });
		return friend;
	} catch (err) {
		throw new Error(`Error creating friend entry: ${err.message}`);
	}
};

const deleteFriendEntry = async (userId, friendId) => {
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
			await friend.destroy();
			return { message: `Relationship between ${userId} and ${friendId} deleted successfully` };
		} else {
			throw new Error(`Relationship between ${userId} and ${friendId} not found`);
		}
	} catch (err) {
		throw new Error(`Error deleting friend entry: ${err.message}`);
	}
};

const updateFriendStatus = async (userId, friendId, status) => {
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
			friend.status = status;
			await friend.save();
			return friend;
		} else {
			throw new Error(`Relationship between ${userId} and ${friendId} not found`);
		}
	} catch (err) {
		throw new Error(`Error updating friend status: ${err.message}`);
	}
};

const getAllFriendsEntriesFromUser = async (userId, status) => {
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

const getAllFriendsEntries = async () => {
	try {
		const friends = await Friend.findAll({});
		return friends;
	} catch (err) {
		throw new Error(`Error fetching friends: ${err.message}`);
	}
};

