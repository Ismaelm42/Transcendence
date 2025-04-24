import db from '../database/models/index.cjs';
import { Op } from 'sequelize';
const { Friend } = db;

export const createFriendEntry = async (userId, friendId) => {
	try {
		const friend = await Friend.create({ userId, friendId });
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
			await friend.destroy();
			return { message: `Relationship between ${userId} and ${friendId} deleted successfully` };
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

