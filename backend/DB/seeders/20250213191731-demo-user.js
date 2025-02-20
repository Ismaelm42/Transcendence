'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
	up: async (queryInterface, Sequelize) => {
	  return queryInterface.bulkInsert('users', [
		{
		  username: 'Pepito',
		  password: 'pass123',
		  created_at: new Date(),
		  updated_at: new Date(),
		},
	  ]);
	},
	down: async (queryInterface, Sequelize) => {
	  return queryInterface.bulkDelete('users', null, {});
	}
};
