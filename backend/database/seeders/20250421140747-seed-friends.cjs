'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert('friends', [
			{
				user_id: 1,
				friend_id: 2,
				status: 'pending',
				was_friend: false,
				created_at: new Date(),
				updated_at: new Date(),
			},
			{
				user_id: 1,
				friend_id: 3,
				status: 'pending',
				was_friend: false,
				created_at: new Date(),
				updated_at: new Date(),
			},
			{
				user_id: 1,
				friend_id: 4,
				status: 'accepted',
				was_friend: true,
				created_at: new Date(),
				updated_at: new Date(),
			},
			{
				user_id: 1,
				friend_id: 5,
				status: 'blocked',
				was_friend: false,
				created_at: new Date(),
				updated_at: new Date(),
			},
			{
				user_id: 5,
				friend_id: 2,
				status: 'pending',
				created_at: new Date(),
				updated_at: new Date(),
			},
			{
				user_id: 5,
				friend_id: 3,
				status: 'pending',
				created_at: new Date(),
				updated_at: new Date(),
			},
			{
				user_id: 5,
				friend_id: 4,
				status: 'accepted',
				was_friend: true,
				created_at: new Date(),
				updated_at: new Date(),
			},
		], {});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('friends', null, {});
	}
};

// docker exec -it backend bash && cd ./database && npx sequelize-cli db:seed:all --debug
// docker exec -it backend bash && cd ./database && npx sequelize-cli db:seed:undo:all

// ISM: With bulkInsert, neither the “validate” nor the “hook” of the Friend model is taken into account, so if you want to insert data in the seeders, it is important that this data is correct.
