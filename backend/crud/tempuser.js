import db from '../database/models/index.cjs';
import pkg from '../database/models/index.cjs';
const { Tempuser } = db;
const { sequelize } = pkg;

// Rutas para probar la creación de los usuarios temporales y su eliminación
// todo: ver si eliminamos este archivo en prodcutivo para myor segurdidad ya que solo se deben gestionar desde el back

export const createTempuser = async (tournamentId, tournamentName) => {
	console.log('Creating temp user with:', tournamentId, tournamentName);
	if (!tournamentName || tournamentName.toString().trim() === '' || !tournamentId || String(tournamentId).toString().trim() === '') {
		throw new Error('tournamentName cannot be empty');
	}
	try {
		const newTempuser = await Tempuser.create({
			tournamentId: tournamentId,
			tournamentUsername: tournamentName
		});
		return newTempuser;
	}
	catch (err) {
		if (err.name === 'SequelizeUniqueConstraintError') {
			throw new Error(err.errors[0].path + ' already exists');
		}
		throw new Error(`Error creating user: ${err.message}`);
	}
};

export const getTempUsers = async () => {
	try {
		const TempUsers = await Tempuser.findAll({});
		return TempUsers;
	} catch (err) {
		throw new Error(`Error fetching users ${err.message}`);
	}
};

export const deleteTempuserByTournamentId = async (TournamentId) => {
	console.log('Deleting temp user by TournamentId:', TournamentId);
	try {
		const TempUsers = await Tempuser.findAll();
		for (const tempUser of TempUsers) {
			console.log('Temp user:', tempUser.dataValues.tournamentId);
			// Check if the tempUser's Tournament_id m	atches the provided TournamentId
			console.log('Checking temp user:', tempUser.dataValues.tournamentId, 'against TournamentId:', TournamentId);
			if (String(tempUser.dataValues.tournamentId) === String(TournamentId)) {
				console.log(`[DEBUG] Deleting temp user ${tempUser.dataValues.tournamentUsername} (ID: ${tempUser.dataValues.id})`);
				await tempUser.destroy();
			}
		}
	} catch (err) {
		throw new Error(`Error deleting user ${err.message}`);
	}
};

export const deleteAllUsers = async () => {
	try {
		const tempusers = await Tempuser.findAll();
		for (const user of tempusers) {
			await user.destroy();
		}
		return { message: 'All temporary users deleted successfully' };
	} catch (err) {
		throw new Error(`Error deleting users ${err.message}`);
	}
};
