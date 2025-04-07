'use strict';
const { hashPassword } = require('../users/PassUtils.cjs'); 

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert('users', [
			{
				username: 'ismael',
				password: await hashPassword('1234'),
				email: 'ismael@gmail.com',
				last_login: new Date(),
				created_at: new Date(),
				updated_at: new Date(),
			},
			{
				username: 'alfonso',
				password: await hashPassword('1234'),
				email: 'alfonso@gmail.com',
				last_login: new Date(),
				created_at: new Date(),
				updated_at: new Date(),
			},
		], {});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('users', null, {});
	}
};

// docker exec -it backend bash && cd ./database && npx sequelize-cli db:seed:all --debug
// docker exec -it backend bash && cd ./database && npx sequelize-cli db:seed:undo:all
