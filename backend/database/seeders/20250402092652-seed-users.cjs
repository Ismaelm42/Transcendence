'use strict';

const { User } = require('../models/index.cjs');
const { hashPassword } = require('../users/PassUtils.cjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
	  const users = [
		{
		  username: 'ismael',
		  password: await hashPassword('12345678'),
		  email: 'ismael@gmail.com',
		  lastLogin: new Date(),
		  chessRating: 2100
			},
			{
				username: 'alfonso',
				password: await hashPassword('12345678'),
				email: 'alfonso@gmail.com',
				lastLogin: new Date(),
		  chessRating: 1900
			},
			{
				username: 'fernando',
				password: await hashPassword('12345678'),
				email: 'fernando@gmail.com',
				lastLogin: new Date(),
		  chessRating: 2300
			},
			{
				username: 'pedro',
				password: await hashPassword('12345678'),
				email: 'pedro@gmail.com',
				lastLogin: new Date(),
		  chessRating: 2250
			},
			{
				username: 'user',
				password: await hashPassword('12345678'),
				email: 'user@gmail.com',
				lastLogin: new Date(),
		  chessRating: 1700
		},
	  ];
  
	  for (const user of users) {
		await User.create(user);
	  }
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('users', {
			username: {
				[Sequelize.Op.like]: '%'
			}
		}, {});
	}
};


// 'use strict';

// const { User } = require('../models/index.cjs');
// const { hashPassword } = require('../users/PassUtils.cjs');

// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
// 	async up(queryInterface, Sequelize) {
// 	  const users = [
// 		{
// 		  username: 'ismael',
// 		  password: await hashPassword('1234'),
// 		  email: 'ismael@gmail.com',
// 		  last_login: new Date(),
// 		},
// 		{
// 		  username: 'alfonso',
// 		  password: await hashPassword('1234'),
// 		  email: 'alfonso@gmail.com',
// 		  last_login: new Date(),
// 		},
// 		{
// 		  username: 'fernando',
// 		  password: await hashPassword('1234'),
// 		  email: 'fernando@gmail.com',
// 		  last_login: new Date(),
// 		},
// 		{
// 		  username: 'pedro',
// 		  password: await hashPassword('1234'),
// 		  email: 'pedro@gmail.com',
// 		  last_login: new Date(),
// 		},
// 		{
// 		  username: 'user',
// 		  password: await hashPassword('1234'),
// 		  email: 'user@gmail.com',
// 		  last_login: new Date(),
// 		},
// 	  ];
  
// 	  for (const user of users) {
// 		await User.create(user);
// 	  }
// 	},
  
// 	async down(queryInterface, Sequelize) {
// 	  await queryInterface.bulkDelete('users', null, {});
// 	}
//   };

// // docker exec -it backend bash && cd ./database && npx sequelize-cli db:seed:all --debug
// // docker exec -it backend bash && cd ./database && npx sequelize-cli db:seed:undo:all
