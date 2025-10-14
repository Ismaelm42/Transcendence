'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert('gamelogs', [
			{ user1: 1, user2: 4, winner: 4, loser: 1, duration: 4200, tournament_id: null, created_at: new Date('2025-10-14T15:06:03.554Z'), updated_at: new Date('2025-10-14T15:06:03.554Z') },
			{ user1: 2, user2: 3, winner: 2, loser: 3, duration: 3400, tournament_id: null, created_at: new Date('2025-10-14T15:06:03.554Z'), updated_at: new Date('2025-10-14T15:06:03.554Z') },
			{ user1: 5, user2: 1, winner: 5, loser: 1, duration: 3900, tournament_id: null, created_at: new Date('2025-10-14T15:06:03.554Z'), updated_at: new Date('2025-10-14T15:06:03.554Z') },
			{ user1: 3, user2: 4, winner: 4, loser: 3, duration: 4800, tournament_id: null, created_at: new Date('2025-10-14T15:06:03.554Z'), updated_at: new Date('2025-10-14T15:06:03.554Z') },
			{ user1: 2, user2: 5, winner: 2, loser: 5, duration: 3500, tournament_id: null, created_at: new Date('2025-10-14T15:06:03.554Z'), updated_at: new Date('2025-10-14T15:06:03.554Z') },
			{ user1: 1, user2: 3, winner: 3, loser: 1, duration: 4000, tournament_id: null, created_at: new Date('2025-10-14T15:06:03.554Z'), updated_at: new Date('2025-10-14T15:06:03.554Z') },
			{ user1: 4, user2: 2, winner: 2, loser: 4, duration: 4700, tournament_id: null, created_at: new Date('2025-10-14T15:06:03.554Z'), updated_at: new Date('2025-10-14T15:06:03.554Z') },
			{ user1: 5, user2: 3, winner: 3, loser: 5, duration: 4900, tournament_id: null, created_at: new Date('2025-10-14T15:06:03.554Z'), updated_at: new Date('2025-10-14T15:06:03.554Z') },
			{ user1: 1, user2: 2, winner: 2, loser: 1, duration: 3600, tournament_id: null, created_at: new Date('2025-10-14T15:06:03.554Z'), updated_at: new Date('2025-10-14T15:06:03.554Z') },
			{ user1: 4, user2: 5, winner: 5, loser: 4, duration: 3300, tournament_id: null, created_at: new Date('2025-10-14T15:06:03.554Z'), updated_at: new Date('2025-10-14T15:06:03.554Z') },
			{ user1: 3, user2: 1, winner: 1, loser: 3, duration: 4700, tournament_id: null, created_at: new Date('2025-10-14T15:06:03.554Z'), updated_at: new Date('2025-10-14T15:06:03.554Z') },
			{ user1: 2, user2: 4, winner: 4, loser: 2, duration: 3800, tournament_id: null, created_at: new Date('2025-10-14T15:06:03.554Z'), updated_at: new Date('2025-10-14T15:06:03.554Z') },
			{ user1: 5, user2: 1, winner: 5, loser: 1, duration: 4500, tournament_id: null, created_at: new Date('2025-10-14T15:06:03.554Z'), updated_at: new Date('2025-10-14T15:06:03.554Z') },
			{ user1: 3, user2: 2, winner: 3, loser: 2, duration: 4100, tournament_id: null, created_at: new Date('2025-10-14T15:06:03.554Z'), updated_at: new Date('2025-10-14T15:06:03.554Z') },
			{ user1: 4, user2: 5, winner: 4, loser: 5, duration: 3600, tournament_id: null, created_at: new Date('2025-10-14T15:06:03.554Z'), updated_at: new Date('2025-10-14T15:06:03.554Z') },
			{ user1: 4, user2: 5, winner: 4, loser: 5, duration: 3600, tournament_id: 1, created_at: new Date('2025-10-14T18:06:03.554Z'), updated_at: new Date('2025-10-14T18:06:03.554Z') },
			{ user1: -1, user2: 2, winner: -1, loser: 2, duration: 7089, tournament_id: 1, created_at: new Date('2025-10-14T18:08:30.073Z'), updated_at: new Date('2025-10-14T18:08:30.073Z') },
			{ user1: 2, user2: 3, winner: 2, loser: 3, duration: 12255, tournament_id: 2, created_at: new Date('2025-10-14T20:08:10.895Z'), updated_at: new Date('2025-10-14T20:08:10.895Z') },
			{ user1: 1, user2: 4, winner: 1, loser: 4, duration: 20327, tournament_id: 2, created_at: new Date('2025-10-14T20:08:39.023Z'), updated_at: new Date('2025-10-14T20:08:39.023Z') },
			{ user1: 2, user2: 1, winner: 2, loser: 1, duration: 16330, tournament_id: 2, created_at: new Date('2025-10-14T20:08:59.719Z'), updated_at: new Date('2025-10-14T20:08:59.719Z') },
			{ user1: -1, user2: -2, winner: -1, loser: -2, duration: 8204, tournament_id: 3, created_at: new Date('2025-10-14T20:10:05.371Z'), updated_at: new Date('2025-10-14T20:10:05.371Z') },
			{ user1: 2, user2: -1, winner: -1, loser: 2, duration: 9769, tournament_id: 3, created_at: new Date('2025-10-14T20:10:19.142Z'), updated_at: new Date('2025-10-14T20:10:19.142Z') },
			{ user1: 1, user2: -1, winner: -1, loser: 1, duration: 86695, tournament_id: 3, created_at: new Date('2025-10-14T20:11:50.546Z'), updated_at: new Date('2025-10-14T20:11:50.546Z') }
		], {});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('gamelogs', null, {});
	}
};

// docker exec -it backend bash && cd ./database && npx sequelize-cli db:seed:all --debug
// docker exec -it backend bash && cd ./database && npx sequelize-cli db:seed:undo:all
