const db = require('../database/models/index.cjs');
const { hashPassword } = require('../database/users/PassUtils.cjs');
const { Op } = require('sequelize');
const { User, Gamelog, Friend } = db;

const createUser = async (username, password, googleId, email, avatarPath) => {
	if (!username || !email) {
		throw new Error('Username and Email cannot be empty');
	}
	if (!googleId && !password) {
		throw new Error('Password or GoogleId must be provided');
	}
	try {
		let hashedPassword = null;
		if (password)
			hashedPassword = await hashPassword(password);
		const userData = { username, email };
		if (hashedPassword)
			userData.password = hashedPassword;
		if (googleId)
			userData.googleId = googleId;
		if (avatarPath)
			userData.avatarPath = avatarPath;
		const newUser = await User.create(userData);
		return newUser;
	}
	catch (err) {
		if (err.name === 'SequelizeUniqueConstraintError') {
			throw new Error( err.errors[0].path + ' already exists');
		}
		throw new Error(`Error creating user: ${err.message}`);
	}
};

const getUserById = async (userId) => {
	try {
		const user = await User.findByPk(userId);
		return user;
	} catch (err) {
		throw new Error(`User not found at getUserById ${err.message}`);
	}
};

const updateUserbyId = async (userId, username, tournamentUsername, password, googleId, email, avatarPath) => {
	try {
		let user = await User.findByPk(userId);
		if (user) {
			if (username)
				user.username = username;
			if (tournamentUsername)
				user.tournamentUsername = tournamentUsername;
            if (password) {
                const hashedPassword = await hashPassword(password);
                user.password = hashedPassword;
            }
			if (googleId)
				user.googleId = googleId;
			if (email)
				user.email = email;
			if (avatarPath)
				user.avatarPath = avatarPath;
			await user.save();
			return user;
		} else {
			return { error: `User ${userId} not found at updateUserbyId` };
		}
	} catch (err) {
		if (err.name === 'SequelizeUniqueConstraintError') {
			throw new Error( err.errors[0].path + ' already exists');
		}
		throw new Error(`Error creating user: ${err.message}`);
	}
};

const getUserByName = async (username) => {
	try {
		const user = await User.findOne({ where: { username } });
		return user;
	} catch (err) {
		throw new Error(`User not found at getUserByName ${err.message}`);
	}
};

const getUserByTournamentName = async (tournamentUsername) => {
	try {
		const user = await User.findOne({ where: { tournamentUsername } });
		return user;
	} catch (err) {
		throw new Error(`User not found at getUserByName ${err.message}`);
	}
};

const getUserByEmail = async (email) => {
	try {
		const user = await User.findOne({ where: { email } });
		return user;
	} catch (err) {
		throw new Error(`User not found at getUserByEmail ${err.message}`);
	}
};

const getUserByGoogleId = async (googleId) => {
	try {
		const user = await User.findOne({ where: { googleId } });
		return user;
	} catch (err) {
		throw new Error(`User not found at getUserByGoogleId ${err.message}`);
	}
};

const getUsers = async () => {
	try {
		const users = await User.findAll({});
		return users;
	} catch (err) {
		throw new Error(`Error fetching users ${err.message}`);
	}
};

const deleteUserById = async (userId) => {
	try {
		const user = await User.findByPk(userId);
		if (user) {
			await user.destroy();
			return { message: `User ${userId} deleted successfully` };
		} else {
			return { error: `User ${userId} not found deleteUserbyId` };
		}
	} catch (err) {
		throw new Error(`Error deleting user ${err.message}`);
	}
};

const deleteAllUsers = async () => {
	try {
		const users = await User.findAll();
		for (const user of users) {
			await user.destroy();
		}
		return { message: 'All users deleted successfully' };
	} catch (err) {
		throw new Error(`Error deleting users ${err.message}`);
	}
};

const updateLastLoginById = async (userId) => {
	try {
		const user = await User.findByPk(userId);
		if (user) {
			user.lastLogin = new Date();
			await user.save();
			return user;
		} else {
			return { error: `User ${userId} not found at updateLastLogin` };
		}
	} catch (err) {
		throw new Error(`Error updating last login ${err.message}`);
	}
};

const updateLastLogoutById = async (userId) => {
	try {
		const user = await User.findByPk(userId);
		if (user) {
			user.lastLogout = new Date();
			await user.save();
			console.log('User lastLogout updated', user.lastLogout);
			return user;
		} else {
			return { error: `User ${userId} not found at updateLastLogout` };
		}
	} catch (err) {
		throw new Error(`Error updating last logout ${err.message}`);
	}
}

const getGamelogs = async () => {
	try {
		const gamelogs = await Gamelog.findAll({});
		return gamelogs;
	} catch (err) {
		throw new Error(`Error fetching gamelogs ${err.message}`);
	}
};

const getGamelogsByUserId = async (userId) => {
	try {
		const [userGamelogs] = await db.sequelize.query(
			'SELECT * FROM "Usergamelog" WHERE "userId" = :userId',
			{
				type: db.Sequelize.QueryTypes.SELECT,
				replacements: { userId },
			}
		);
		return userGamelogs;
	} catch (err) {
		throw new Error(`Error fetching user gamelogs: ${err.message}`);
	}
};

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


module.exports = {
	createUser,
	getUserById,
	updateUserbyId,
	getUserByName,
	getUserByTournamentName,
	getUserByEmail,
	getUserByGoogleId,
	getUsers,
	deleteUserById,
	deleteAllUsers,
	updateLastLoginById,
	updateLastLogoutById,
	getGamelogs,
	getGamelogsByUserId,
	createFriendEntry,
	deleteFriendEntry,
	updateFriendStatus,
	getAllFriendsEntriesFromUser,
	getAllFriendsEntries,
};
