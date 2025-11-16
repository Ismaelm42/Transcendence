import { exec } from 'child_process';

export const runMigrations = () => {
	return new Promise((resolve, reject) => {
		exec('npx sequelize-cli db:migrate', { cwd: '/app/database/' }, (err, stdout, stderr) => {
			if (err) {
				reject(`Error executing migration: ${stderr || err.message}`);
			} else {
				resolve(stdout);
			}
		});
	});
};

export const runSeeders = (sequelize) => {
	return new Promise(async (resolve, reject) => {
		const { User } = sequelize.models;
		const userCount = await User.count();
		if (userCount > 0) {
			return resolve('Seeders not needed');
		}
		exec('npx sequelize-cli db:seed:all --debug', { cwd: '/app/database/' }, (err, stdout, stderr) => {
			if (err) {
				reject(`Error executing seeder: ${stderr || stdout || err.message}`);
			} else {
				resolve(stdout);
			}
		});
	});
};
