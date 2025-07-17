import fastify from 'fastify';
import db from '../database/models/index.cjs';
import pkg from '../database/models/index.cjs';
import { Console } from 'console';
const { Tournamentlog } = db;
const { sequelize, Sequelize } = pkg;


export const getTournamentlogs = async () => {
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
		const result = await Tournamentlog.findOne({
			order: [['createdAt', 'DESC']],
			attributes: ['tournamentId'],
		});
		let tournamentId = result && result.tournamentId ? result.tournamentId + 1 : 1;
		console.log('Next tournamentlog ID:', tournamentId);
		const newTournamentlog = await createTournamentlog(tournamentId,null,null,null,null);
		console.log('Created new tournamentlog:', newTournamentlog);
		return tournamentId;
	} catch (err) {
		throw new Error(`Error fetching next tournamentlog ID: ${err.message}`);
	}
}

// tested and working
export const createTournamentlog = async (tournamentId, playerscount, config, users, gamesData) => {
		if (!tournamentId) {
		throw new Error('tournamentId cannot be empty');
	}
	console.log('Creating tournamentlog with:', tournamentId, playerscount, config, users, gamesData);
	try {
		const tournamentData = { tournamentId };
		if (playerscount && playerscount !== undefined)
			tournamentData.playerscount = playerscount;
		if (config && config !== undefined)
			tournamentData.config = config;
		if (users && users !== undefined)
			tournamentData.users = users;
		if (gamesData && gamesData !== undefined)
			tournamentData.gamesData = gamesData;
		const newTournamentlog = await Tournamentlog.create(tournamentData);
		return newTournamentlog;
	} catch (err) {
		throw new Error(`Error creating tournamentlog: ${err.message}`);
	}
};

const findplayerById = (gamesData, playerId) => {
	if (!gamesData || !Array.isArray(gamesData)) return null;
	for (const game of gamesData) {
		if (game.player1 && game.player1.id === playerId) {
			return game.player1;
		}
		if (game.player2 && game.player2.id === playerId) {
			return game.player2;
		}
	}
	return null;
}


const returnMode = (player1, player2) =>{
		console.log("Returning mode for players:", player1, player2);
		if (player1.email.includes('ai') && player1.email.includes('@transcendence.com') 
				&& player2.email.includes('ai') && player2.email.includes('@transcendence.com') 
				|| player1.id == "2" || player2.id == "2" ) { // todo quitarme del metodo automático elimina referencias a id=="2"
			return 'auto';
		} else if ((player1.email.includes('ai') && player1.email.includes('@transcendence.com')) 
				|| ( player2.email.includes('ai') && player2.email.includes('@transcendence.com'))) {
			return '1vAI';
		} else {
			return '1v1';
		}
	}

const updateGameData = (playerscount, gamesData) => {
	if (gamesData && gamesData !== undefined && playerscount && playerscount !== undefined) {
		var GameDataFinal;
		if (playerscount === 4) 
			GameDataFinal = 3;
		else if (playerscount === 8)
			GameDataFinal = 8;
		else if (playerscount === 6)
			GameDataFinal = 5;	
			for (let i = 0; i < GameDataFinal; i++) {
				console.log(" gamesData " +i + " :" + JSON.stringify(gamesData[i]));
				if (gamesData[i] !== undefined &&
						gamesData[i].result && gamesData[i].result.winner !== undefined && gamesData[i].result.winner !== '') {
					console.log(" gamesData " +i + " dentro del if: ");
					
							const winner = gamesData[0].result.winner;
					if (gamesData[i].result && gamesData[i].result.winner !== '') {
					const winnerId = gamesData[i].result.winner;
					console.log("WinnerId: " + winnerId);
					// Buscar el usuario con ese id en users
					const winnerUser = findplayerById(gamesData, winnerId);
					console.log("WinnerUser: " + JSON.stringify(winnerUser));
					if (winnerUser) {
						// Asignar al siguiente player1 o player2 vacío en gamesData
						for (let game of gamesData) {
							console.log("Game id " + game.player1.id );
							if (game.player1.id ==='') {
								game.player1.id = winnerUser.id;
								game.player1.username = winnerUser.username;
								game.player1.tournamentUsername = winnerUser.username;
								game.player1.email = winnerUser.email;
								game.player1.avatarPath = winnerUser.avatarPath;

								break;
							} else if (game.player2.id ==='') {
								game.player2.id = winnerUser.id;
								game.player2.username = winnerUser.username;
								game.player2.tournamentUsername = winnerUser.username;
								game.player2.email = winnerUser.email;
								game.player2.avatarPath = winnerUser.avatarPath;
								game.mode = returnMode(game.player1, game.player2);
								break;
							}
						}
					}
				}
				// console.log("Winner: " + winner);
				}
			}
		}
	return gamesData;
}

// Tested and working
export const updateTournamentlog = async (tournamentId, playerscount, config, users, gamesData, winner) => {
	try {
		console.log('Updating updateTournamentlog with:', tournamentId, playerscount, config, users, gamesData, winner);
		let tournamentlog = (await Tournamentlog.findAll({ where: { tournamentId } }))[0];
		return Promise.resolve().then(() => {
			console.log('Found tournamentlog:', tournamentlog);
			if (tournamentlog) {
				if (playerscount)
					tournamentlog.playerscount = playerscount;
				if (config)
					tournamentlog.config = config;
				if (users)
					tournamentlog.users = users;
				if (gamesData && playerscount) 
					tournamentlog.gamesData = updateGameData(playerscount,gamesData);
				if (gamesData && !playerscount)
					tournamentlog.gamesData = gamesData;
				if (winner)
					tournamentlog.winner = winner;
				return tournamentlog.save().then(() => tournamentlog);
			}
		});
	} catch (err) {
		throw new Error(`Error updating tournamentlog: ${err.message}`);
	}
};

//TODO: remove routes that call this function before evaluation
export const deleteAllTournamentlogs = async () => {
	try {
		const tournamentlogs = await Tournamentlog.findAll();
		for (const tournamentlog of tournamentlogs) {
			await tournamentlog.destroy();
		}
		return { message: 'All tournamentlogs deleted successfully' };
	} catch (err) {
		throw new Error(`Error deleting tournamentlogs ${err.message}`);
	}
}
