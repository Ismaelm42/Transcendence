'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert('chessgamelogs', [
			{ user1: 2, user2: -2, winner: -2, loser: 2, endtype: 'resignation', draw: 0, created_at: '2025-10-14T18:24:45.855Z', updated_at: '2025-10-14T18:24:45.855Z' },
			{ user1: 1, user2: 2, winner: 1, loser: 2, endtype: 'timeout', draw: 0, created_at: '2025-10-14T20:02:32.401Z', updated_at: '2025-10-14T20:02:32.401Z' },
			{ user1: 2, user2: 1, winner: null, loser: null, endtype: 'agreement', draw: 1, created_at: '2025-10-14T20:02:43.992Z', updated_at: '2025-10-14T20:02:43.992Z' },
			{ user1: 1, user2: 2, winner: 2, loser: 1, endtype: 'resignation', draw: 0, created_at: '2025-10-14T20:02:57.486Z', updated_at: '2025-10-14T20:02:57.486Z' },
			{ user1: 2, user2: -2, winner: 2, loser: -2, endtype: 'checkmate', draw: 0, created_at: '2025-10-14T20:03:34.668Z', updated_at: '2025-10-14T20:03:34.668Z' },
			{ user1: 1, user2: 2, winner: 1, loser: 2, endtype: 'checkmate', draw: 0, created_at: '2025-10-14T20:04:36.148Z', updated_at: '2025-10-14T20:04:36.148Z' },
			{ user1: 2, user2: 1, winner: 2, loser: 1, endtype: 'checkmate', draw: 0, created_at: '2025-10-14T20:05:54.983Z', updated_at: '2025-10-14T20:05:54.983Z' }
		], {});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('chessgamelogs', null, {});
	}
};

// docker exec -it backend bash && cd ./database && npx sequelize-cli db:seed:all --debug
// docker exec -it backend bash && cd ./database && npx sequelize-cli db:seed:undo:all
