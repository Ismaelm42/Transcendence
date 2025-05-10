'use strict';

const { User } = require('../models/index.cjs');
const { hashPassword } = require('../users/PassUtils.cjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
	  const users = [
		{
		  username: 'ismael',
		  password: await hashPassword('1234'),
		  email: 'ismael@gmail.com',
		  last_login: new Date(),
		},
		{
		  username: 'alfonso',
		  password: await hashPassword('1234'),
		  email: 'alfonso@gmail.com',
		  last_login: new Date(),
		},
		{
		  username: 'fernando',
		  password: await hashPassword('1234'),
		  email: 'fernando@gmail.com',
		  last_login: new Date(),
		},
		{
		  username: 'pedro',
		  password: await hashPassword('1234'),
		  email: 'pedro@gmail.com',
		  last_login: new Date(),
		},
		{
		  username: 'user',
		  password: await hashPassword('1234'),
		  email: 'user@gmail.com',
		  last_login: new Date(),
		},
	  ];
  
	  for (const user of users) {
		await User.create(user);
	  }
	},
  
	async down(queryInterface, Sequelize) {
	  await queryInterface.bulkDelete('users', null, {});
	}
  };

// docker exec -it backend bash && cd ./database && npx sequelize-cli db:seed:all --debug
// docker exec -it backend bash && cd ./database && npx sequelize-cli db:seed:undo:all
