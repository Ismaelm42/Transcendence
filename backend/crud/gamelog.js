const db = require('../database/models/index.cjs');
const { hashPassword } = require('../database/users/PassUtils.cjs');
const { Op } = require('sequelize');
const { User, Gamelog, Friend } = db;

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
