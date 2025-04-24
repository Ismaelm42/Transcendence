import db from '../database/models/index.cjs';
import pkg from '../database/models/index.cjs';
const { sequelize, Sequelize } = pkg;
const { Gamelog } = db;

export const getGamelogs = async () => {
	try {
		const gamelogs = await Gamelog.findAll({});
		return gamelogs;
	} catch (err) {
		throw new Error(`Error fetching gamelogs ${err.message}`);
	}
};

export const getGamelogsByUserId = async (userId) => {
	try {
		const [userGamelogs] = await sequelize.query(
			'SELECT * FROM "Usergamelog" WHERE "userId" = :userId',
			{
				type: Sequelize.QueryTypes.SELECT,
				replacements: { userId },
			}
		);
		return userGamelogs;
	} catch (err) {
		throw new Error(`Error fetching user gamelogs: ${err.message}`);
	}
};
