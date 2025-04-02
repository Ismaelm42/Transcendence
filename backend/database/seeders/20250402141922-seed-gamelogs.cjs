'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert('gamelogs', [
			{
				user1: 1,
				user2: 2,
				winner: 1,
				loser: 2,
				duration: 1000,
				game_id: 'game_100',
				created_at: new Date(),
				updated_at: new Date(),
			},
			{
				user1: 2,
				user2: 1,
				winner: 2,
				loser: 1,
				duration: 500,
				tournament_id: 'tournament_100',
				created_at: new Date(),
				updated_at: new Date(),
			},
		], {});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('gamelogs', null, {});
	}
};

// docker exec -it backend bash && cd ./database && npx sequelize-cli db:seed:all --debug
// docker exec -it backend bash && cd ./database && npx sequelize-cli db:seed:undo:all
