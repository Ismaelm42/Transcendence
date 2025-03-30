const fs = require('fs');
const path = require('path');
// const db_path = require(__dirname + '/db/sqlito.db');
const db_path = path.resolve(__dirname, "../database.sqlite");

module.exports = {
	development: {
	  username: 'root',
	  password: null,
	  database: 'database.sqlite',
	  storage: db_path,
	  dialect: "sqlite",
	},
	test: {
		database: 'root',
		storage: db_path,
		dialect: "sqlite",
	},
	production: {
		USE_ENV_VARIABLE: "DATABASE_URL",
		database: 'sqlito.db',
		dialect: "sqlite",
	},
  };


// module.exports = {
//   development: {
//     username: 'database_dev',
//     password: 'database_dev',
//     database: 'database_dev',
//     host: '127.0.0.1',
//     port: 3306,
//     dialect: 'mysql',
//     dialectOptions: {
//       bigNumberStrings: true,
//     },
//   },
//   test: {
//     username: process.env.CI_DB_USERNAME,
//     password: process.env.CI_DB_PASSWORD,
//     database: process.env.CI_DB_NAME,
//     host: '127.0.0.1',
//     port: 3306,
//     dialect: 'mysql',
//     dialectOptions: {
//       bigNumberStrings: true,
//     },
//   },
//   production: {
//     username: process.env.PROD_DB_USERNAME,
//     password: process.env.PROD_DB_PASSWORD,
//     database: process.env.PROD_DB_NAME,
//     host: process.env.PROD_DB_HOSTNAME,
//     port: process.env.PROD_DB_PORT,
//     dialect: 'mysql',
//     dialectOptions: {
//       bigNumberStrings: true,
//       ssl: {
//         ca: fs.readFileSync(__dirname + '/mysql-ca-main.crt'),
//       },
//     },
//   },
// };