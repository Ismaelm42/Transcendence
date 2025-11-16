import fastify from 'fastify';
import db from '../database/models/index.cjs';
import pkg from '../database/models/index.cjs';
import { deleteTempuserByTournamentId } from './tempuser.js';
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


export const getTournamentlogsByUserId = async (userId) => {
	try {
		const tournaments = await sequelize.query(`SELECT id, playerscount, users, winner FROM tournamentlogs`, 
			{ type: sequelize.QueryTypes.SELECT });

		  // filters for each row:
		  const queries = tournaments.map(t => {
		    const conditions = [];
			// we cannot iterate over undefined length arrays
		  	const count = t.playerscount || 4; // default value in case of an empty value
			// add condition to check if any playerId in users=  userId
			for (let i = 0; i < count; i++) {
		      conditions.push(`
		        (json_extract(users, '$[${i}].gameplayer.id') = ${userId})
		      `);
		    }
		    return `(id = ${t.id} AND (${conditions.join(' OR ')}))`;
		  });

		  // get the final query:
		  /*
		    SELECT *
		    FROM tournamentlogs
		    WHERE (id = 1 AND (
		        (json_extract(users, '$[0].gameplayer.id') = 6)
		       OR 
		        (json_extract(users, '$[1].gameplayer.id') = 6)
		       OR 
		        (json_extract(users, '$[2].gameplayer.id') = 6)
		       OR 
		        (json_extract(users, '$[3].gameplayer.id') = 6)
		      )) OR (id = 2 AND (
		        (json_extract(users, '$[0].gameplayer.id') = 6)
		       OR 
		        (json_extract(users, '$[1].gameplayer.id') = 6)
		       OR 
		        (json_extract(users, '$[2].gameplayer.id') = 6)
		       OR 
		        (json_extract(users, '$[3].gameplayer.id') = 6)
		      )) OR (id = 3 AND (
		        (json_extract(users, '$[0].gameplayer.id') = 6)
		       OR 
		        (json_extract(users, '$[1].gameplayer.id') = 6)
		       OR 
		        (json_extract(users, '$[2].gameplayer.id') = 6)
		       OR 
		        (json_extract(users, '$[3].gameplayer.id') = 6)
		      ))
		  */
		  const finalQuery = `
		    SELECT *
		    FROM tournamentlogs
		    WHERE ${queries.join(' OR ')}
		  `;

		  // Executing the query
		  const [results] = await sequelize.query(finalQuery);
		  return results;
	} catch (err) {
		throw new Error(`Error fetching tournamentlogs ${err.message}`);
	}
};

// like getTournamentlogsByUserId but filtering also by winner
export const getTournamentWinsByUserId = async (userId) => {
	try {
		const tournaments = await sequelize.query(`SELECT id, playerscount, users, winner FROM tournamentlogs`, 
			{ type: sequelize.QueryTypes.SELECT });
			const queries = tournaments.map(t => {
		    const conditions = [];
		    const count = t.playerscount || 4;
		    for (let i = 0; i < count; i++) {
		      conditions.push(`
		        (json_extract(users, '$[${i}].gameplayer.id') = ${userId}
		         AND winner = json_extract(users, '$[${i}].gameplayer.tournamentUsername'))
		      `);
		    }
		    return `(id = ${t.id} AND (${conditions.join(' OR ')}))`;
		  });
		  const finalQuery = `
		    SELECT *
		    FROM tournamentlogs
		    WHERE ${queries.join(' OR ')}
		  `;
		  const [results] = await sequelize.query(finalQuery);
		  return results;
	} catch (err) {
		throw new Error(`Error fetching tournamentlogs ${err.message}`);
	}
};

//// funcion anterior a medio camino entre games y torneo
// export const getTournamentlogsByUserId = async (userId) => {
// 	try {
// 		const [userTournamentlogs] = await sequelize.query(
// 			'SELECT * FROM "Usergamelog" WHERE "userId" = :userId',
// 			{
// 				type: Sequelize.QueryTypes.SELECT,
// 				replacements: { userId },
// 			}
// 		);
// 		return userTournamentlogs;
// 	} catch (err) {
// 		throw new Error(`Error fetching user tournamentlogs: ${err.message}`);
// 	}
// };

// tested and working
export const getNextTournamentlogId = async () => {
	try {
		const result = await Tournamentlog.findOne({
			order: [['createdAt', 'DESC']],
			attributes: ['tournamentId'],
		});
		let tournamentId = result && result.tournamentId ? result.tournamentId + 1 : 1;
		const newTournamentlog = await createTournamentlog(tournamentId,null,null,null,null);
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

/**
 * Finds a player by their username. used to identify the winner by its username
 * @param {*} users 
 * @param {*} username 
 * @returns player information
 */
const findplayerByUsername= (users, username) => {
	if (!users || !Array.isArray(users)) return null;
	for (const user of users) {
		if (user.gameplayer && user.gameplayer.username === username) {
			return user.gameplayer;
		}
	}
	return null;
}

const returnMode = (player1, player2) =>{
		if (player1.id === -1 && player2.id === -1) {
			return 'auto';
		} else if (player1.id === -1 || player2.id === -1) {
			return '1vAI';
		} else {
			return '1v1';
		}
}

// /** OLD retunrmode function
// /**
//  * it compares email in order to decide if game mode is auto (AIvAI),1vAI or 1v1.  
//  * @param {} player1 
//  * @param {*} player2 
//  * @returns game mode 
//  */
// const returnMode = (player1, player2) =>{
// 		if (player1.email.includes('ai') && player1.email.includes('@transcendence.com') 
// 				&& player2.email.includes('ai') && player2.email.includes('@transcendence.com')) { 
// 			return 'auto';
// 		} else if ((player1.email.includes('ai') && player1.email.includes('@transcendence.com')) 
// 				|| ( player2.email.includes('ai') && player2.email.includes('@transcendence.com'))) {
// 			return '1vAI';
// 		} else {
// 			return '1v1';
// 		}
// }

// These functions has to be uncomment in case that we use the Id as winner info

// const findplayerById = (users, playerId) => {
// 	if (!users || !Array.isArray(users)) return null;
// 	for (const user of users) {
// 		if (user.gameplayer && user.gameplayer.id === playerId) {
// 			return user.gameplayer;
// 		}
// 	}
// 	return null;
// }

// const updateGameData = (users,playerscount, gamesData) => {
// 	if (!gamesData || !playerscount) return gamesData;
	
// 	// 1. Buscar el último ganador válido en el array
// 	let lastWinnerId = null;
// 	for (let i = gamesData.length - 1; i >= 0; i--) {
// 		const game = gamesData[i];
// 		if (
// 			game &&
// 			game.result &&
// 			game.result.winner &&
// 			game.result.winner !== ''
// 		) {
// 			lastWinnerId = game.result.winner;
// 			break; // encontramos el último ganador
// 		}
// 	}

// 	// 2. Si hay ganador, buscar sus datos y asignarlo a siguiente slot vacío
// 	if (lastWinnerId) {
// 		const winnerUser = findplayerById(users, lastWinnerId);
// 		if (winnerUser) {
// 			for (let game of gamesData) {
// 				if (game.player1.id === '') {
// 					Object.assign(game.player1, {
// 						id: winnerUser.id,
// 						username: winnerUser.username,
// 						tournamentUsername: winnerUser.tournamentUsername,
// 						email: winnerUser.email,
// 						avatarPath: winnerUser.avatarPath
// 					});
// 					// Si el juego es un Bye, duplicar en player2
// 					if (game.id.includes('Bye')) {
// 						Object.assign(game.player2, {
// 							id: winnerUser.id,
// 							username: winnerUser.username,
// 							tournamentUsername: winnerUser.tournamentUsername,
// 							email: winnerUser.email,
// 							avatarPath: winnerUser.avatarPath
// 						});
// 						game.mode = returnMode(game.player1, game.player2);
// 					}
// 					break;
// 				} else if (game.player2.id === '') {
// 					Object.assign(game.player2, {
// 						id: winnerUser.id,
// 						username: winnerUser.username,
// 						tournamentUsername: winnerUser.tournamentUsername,
// 						email: winnerUser.email,
// 						avatarPath: winnerUser.avatarPath
// 					});
// 					game.mode = returnMode(game.player1, game.player2);
// 					break;
// 				}
// 			}
// 		}
// 	}

// 	return gamesData;
// };


const updateGameData = (users, playerscount, gamesData) => {
	if (!gamesData || !playerscount) return gamesData;
	/**check for the las winner */
	let lastWinnerUsername = null;
	for (let i = gamesData.length - 1; i >= 0; i--) {
		const game = gamesData[i];
		if (
			game &&
			game.result &&
			game.result.winner &&
			game.result.winner !== ''
		) {
			lastWinnerUsername = game.result.winner;
			break;
		}
	}

	// 2. if we have a lastwinner, check if we have to fullfiil a gamedata with this player
	// this approach could be change if we use the game id as reference
	if (lastWinnerUsername) {
		const winnerUser = findplayerByUsername(users, lastWinnerUsername);
		if (winnerUser) {
			for (let game of gamesData) {
				if (game.player1.username === '') {
					Object.assign(game.player1, {
						id: winnerUser.id,
						username: winnerUser.username,
						tournamentUsername: winnerUser.tournamentUsername,
						email: winnerUser.email,
						avatarPath: winnerUser.avatarPath
					});
					Object.assign(game.playerDetails.player1, game.player1)					;
					// Si el juego es un Bye, duplicar en player2
					if (game.id.includes('Bye')) {
						Object.assign(game.player2, {
							id: winnerUser.id,
							username: winnerUser.username,
							tournamentUsername: winnerUser.tournamentUsername,
							email: winnerUser.email,
							avatarPath: winnerUser.avatarPath
						});
						Object.assign(game.playerDetails.player2, game.player2)	
						game.mode = returnMode(game.player1, game.player2);
					}
					break;
				} else if (game.player2.username === '') {
					Object.assign(game.player2, {
						id: winnerUser.id,
						username: winnerUser.username,
						tournamentUsername: winnerUser.tournamentUsername,
						email: winnerUser.email,
						avatarPath: winnerUser.avatarPath
					});
					Object.assign(game.playerDetails.player2, game.player2)	
					game.mode = returnMode(game.player1, game.player2);
					break;
				}
			}
		}
	}

	return gamesData;
};

// Tested and working
export const updateTournamentlog = async (tournamentId, playerscount, config, users, gamesData, winner) => {
	try {
		let tournamentlog = (await Tournamentlog.findAll({ where: { tournamentId } }))[0];
		return Promise.resolve().then(() => {
			if (tournamentlog) {
				if (playerscount)
					tournamentlog.playerscount = playerscount;
				if (config)
					tournamentlog.config = config;
				if (users)
					tournamentlog.users = users;
				if (gamesData && playerscount) 
					tournamentlog.gamesData = updateGameData(tournamentlog.users, playerscount,gamesData);
				if (gamesData && !playerscount)
					tournamentlog.gamesData = gamesData;
				var tempWinner = (gamesData && gamesData.length > 0 && gamesData[gamesData.length - 1].result)
						? gamesData[gamesData.length - 1].result.winner
						: winner;
				if (tempWinner)
					deleteTempuserByTournamentId(tournamentId);
					tournamentlog.winner = tempWinner;
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
