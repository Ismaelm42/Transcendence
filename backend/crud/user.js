import db from '../database/models/index.cjs';
import pkg from '../database/models/index.cjs';
import { Op } from 'sequelize';
import { hashPassword } from '../database/users/PassUtils.cjs';
const { User } = db;
const { sequelize } = pkg;

export const createUser = async (username, password, googleId, email, avatarPath) => {
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

export const getUserById = async (userId) => {
	try {
		const user = await User.findByPk(userId);
		return user;
	} catch (err) {
		throw new Error(`User not found at getUserById ${err.message}`);
	}
};

export const updateUserbyId = async (userId, username, tournamentUsername, password, googleId, email, avatarPath) => {
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

export const getUserByName = async (username) => {
	try {
		const user = await User.findOne({ where: { username } });
		return user;
	} catch (err) {
		throw new Error(`User not found at getUserByName ${err.message}`);
	}
};

export const getUserByTournamentName = async (tournamentUsername) => {
	try {
		const user = await User.findOne({ where: { tournamentUsername } });
		return user;
	} catch (err) {
		throw new Error(`User not found at getUserByName ${err.message}`);
	}
};

export const getUserByEmail = async (email) => {
	try {
		const user = await User.findOne({ where: { email } });
		return user;
	} catch (err) {
		throw new Error(`User not found at getUserByEmail ${err.message}`);
	}
};

export const getUserByGoogleId = async (googleId) => {
	try {
		const user = await User.findOne({ where: { googleId } });
		return user;
	} catch (err) {
		throw new Error(`User not found at getUserByGoogleId ${err.message}`);
	}
};

export const getUsers = async () => {
	try {
		const users = await User.findAll({});
		return users;
	} catch (err) {
		throw new Error(`Error fetching users ${err.message}`);
	}
};

export const deleteUserById = async (userId) => {
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

export const deleteAllUsers = async () => {
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

export const updateLastLoginById = async (userId) => {
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

export const updateLastLogoutById = async (userId) => {
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

export const getAllUsersCoincidences = async (userId, keyword) => {
	try {
		keyword = String(keyword).toLowerCase();
		const users = await User.findAll({
			where: {
				[Op.and]: [
					{ id: { [Op.ne]: userId } },
					{ username: sequelize.where(sequelize.fn('LOWER', sequelize.col('username')), 'LIKE', `${keyword}%`) }
				]
			}
		});
		return users;
	} catch (err) {
		throw new Error(`Error searching for users with ${keyword}: ${err.message}`);
	}
}
