import db from '../database/models/index.cjs';
import pkg from '../database/models/index.cjs';
const { Tournamentlog } = db;
const { sequelize, Sequelize } = pkg;

// TODO : pendiente de probar
export const getTorunamentlogs = async () => {
	try {
		const tournamentlogs = await Tournamentlog.findAll({});
		return tournamentlogs;
	} catch (err) {
		throw new Error(`Error fetching tournamentlogs ${err.message}`);
	}
};

// TODO : pendiente de probar
export const getTournamentlogsByUserId = async (userId) => {
	try {
		const [userTournamentlogs] = await sequelize.query(
			'SELECT * FROM "Usergamelog" WHERE "userId" = :userId',
			{
				type: Sequelize.QueryTypes.SELECT,
				replacements: { userId },
			}
		);
		return userTournamentlogs;
	} catch (err) {
		throw new Error(`Error fetching user tournamentlogs: ${err.message}`);
	}
};

// tested and working
export const getNextTournamentlogId = async () => {
	console.log('Fetching next tournamentlog ID');
	try {
		const [result] = await sequelize.query(
			'SELECT MAX("tournamentId") AS maxId FROM "Tournamentlogs"'
		);
		console.log('Result from database:', result);
		return result.maxId ? result.maxId + 1 : 1; // Start from 1 if no logs exist
	} catch (err) {
		throw new Error(`Error fetching next tournamentlog ID: ${err.message}`);
	}
}

// TODO : pendiente de probar
export const createTournamentlog = async (tournamentlogData) => {
	try {
		const newTournamentlog = await Tournamentlog.create(tournamentlogData);
		return newTournamentlog;
	} catch (err) {
		throw new Error(`Error creating tournamentlog: ${err.message}`);
	}
};

// TODO : pendiente de probar y ver si merece la pena adceptar torunamentData y sacar el valor de este  objeto
export const updateTournamentlog = async (tournamentlogId, playerscount, config, users, games, winner) => {
	try {
		let tournamentlog = await Tournamentlog.findByPk(TournamentId);
		if (tournamentlog) {
			if (playerscount)
				tournamentlog.playerscount = playerscount;
			if (config)
				tournamentlog.config = config;
            if (users) {
				if (Array.isArray(users)) {
					tournamentlog.users = users;
				} else {
					throw new Error('Users must be an array');
				}
            }
			if (games){
				if (Array.isArray(games)) {
					tournamentlog.games = games;
				} else {
					throw new Error('Games must be an array');
				}
			}
			if (winner)
				tournamentlog.winner = winner;
			await tournamentlog.save();
			return tournamentlogId;
		}
	} catch (err) {
		throw new Error(`Error updating tournamentlog: ${err.message}`);
	}
};


			