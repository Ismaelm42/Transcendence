const db = require('./models/index.cjs');
const { hashPassword } = require('./users/PassUtils.cjs');

const { User, Gamelog } = db;

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
		throw new Error('Error creating user: ', err);
	}
};

const getUserById = async (userId) => {
	try {
		const user = await User.findByPk(userId);
		return user;
	} catch (err) {
		throw new Error('User not found at getUserById ', err);
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
		// throw new Error('Error updating user ', err);
		if (err.name === 'SequelizeUniqueConstraintError') {
			throw new Error( err.errors[0].path + ' already exists');
		}
		throw new Error('Error creating user: ', err);
	}
};

const getUserByName = async (username) => {
	try {
		const user = await User.findOne({ where: { username } });
		return user;
	} catch (err) {
		throw new Error('User not found at getUserByName ', err);
	}
};

const getUserByTournamentName = async (tournamentUsername) => {
	try {
		const user = await User.findOne({ where: { tournamentUsername } });
		return user;
	} catch (err) {
		throw new Error('User not found at getUserByName ', err);
	}
};

const getUserByEmail = async (email) => {
	try {
		const user = await User.findOne({ where: { email } });
		return user;
	} catch (err) {
		throw new Error('User not found at getUserByEmail ', err);
	}
};

const getUserByGoogleId = async (googleId) => {
	try {
		const user = await User.findOne({ where: { googleId } });
		return user;
	} catch (err) {
		throw new Error('User not found at getUserByGoogleId ', err);
	}
};

const getUsers = async () => {
	try {
		const users = await User.findAll({});
		return users;
	} catch (err) {
		throw new Error('Error fetching users ', err);
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
		throw new Error('Error deleting user ', err);
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
		throw new Error('Error deleting users ', err);
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
		throw new Error('Error updating last login ', err);
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
		throw new Error('Error updating last logout ', err);
	}
}

const getGamelogs = async () => {
	try {
		const gamelogs = await Gamelog.findAll({});
		return gamelogs;
	} catch (err) {
		throw new Error('Error fetching gamelogs ', err);
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
		throw new Error('Error fetching user gamelogs: ', err.message);
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
};
