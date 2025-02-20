// // 'use strict'
'use strict';

const path = require('path');
const bcrypt = require('bcrypt');
const { Database } = require('sqlite3').verbose();
const client = new Database(path.join(__dirname, '..', 'user_stats.db'));

const saltrounds = 5;

const queries = {
    tableUsers: `
        CREATE TABLE IF NOT EXISTS users (
            user TEXT PRIMARY KEY,
            pass TEXT NOT NULL
        );
    `,
    tableStats: `
        CREATE TABLE IF NOT EXISTS stats (
            user TEXT,
            game TEXT NOT NULL,
            bestScore INTEGER,
            bestConsecutiveWins INTEGER,
            bestTournamentPlacement INTEGER,
            PRIMARY KEY(user),
            FOREIGN KEY(user) 
                REFERENCES users(user)
                    ON DELETE CASCADE 
                    ON UPDATE NO ACTION
        );
    `
};

async function createDb() {
    return new Promise((resolve, reject) => {
        client.serialize(() => {
            client.run(queries.tableUsers);
            client.run(queries.tableStats, err => {
                if (err) 
                    return reject(err);
                resolve({
                    client,
                    createUser,
					getUsers
                });
            });
        });
    });
}

async function createUser(user, pass) {
    const securePass = await bcrypt.hash(pass, saltrounds);
    return new Promise((resolve, reject) => {
        const stmt = client.prepare('INSERT INTO users (user, pass) VALUES (?, ?)');
        stmt.run(user, securePass, err => {
            if (err) return reject(err);
            resolve();
        });
        stmt.finalize();
    });
}

// aplica con el each una consulta por cada registro de la tabla u sers
async function getUsers () {
	return new Promise((resolve, reject) => {
		const users = []
		client.each('SELECT user FROM users', (err, rows) => {
			if(err) return reject(err)
			users.push(rows)
		}, (err, count) => {
			if(err) return reject(err)
			resolve({ count, users })
		})
	})
}


module.exports = {
    createDb
};
// const path = require('path') // modulo de node que permite trabajar con rutas
// const bcrypt = require('bcrypt') // modulo que permite encriptar contraseñas
// const { default: fastify } = require('fastify')
// const saltrounds = 5 // numero de veces que se va a encriptar la contraseña
// const { Database } = require('sqlite3').verbose() // ver documentacion sqlite de npm
// const client = new Database(path.join(__dirname, '..' , 'user_stats.db')) 
// // crea la base de datos en la ruta especificada

// const queries = {
// 	tableUsers: `
// 		CREATE TABLE IF NOT EXISTS users (
// 			user TEXT PRIMARY KEY,
// 			pass TEXT NOT NULL
// 	);
// 	`
// 	,
// 	tableStats:`
// 	CREATE TABLE IF NOT EXISTS stats (
// 	            user TEXT,
// 	            game TEXT NOT NULL,
// 	            bestScore INTEGER,
// 	            bestConsecutiveWins INTEGER,
// 	            bestTournamentPlacement INTEGER,
// 	            PRIMARY KEY(user),
// 	            FOREIGN KEY(user) 
// 	                REFERENCES users(user)
// 	                    ON DELETE CASCADE 
// 	                    ON UPDATE NO ACTION
// 		);
// 		`
// }

// async function createDb () {
// 	return new Promise((resolve, reject) => {
// 		client.serialize(() => {
// 			client.run(queries.tableUsers)
// 			client.run(queries.tableStats, err => {
// 				if(err) 
// 					return reject(err)
// 				resolve({
// 					client,
// 					createUser
// 				})
				
// 			})
// 		})
// 	})
// }

// async function createUser (user, pass) {
// 	const securePass = await bcrypt.hash(pass, saltrounds)
// 	fastify.log.info(`saecurepass= ${securePass}`)
// 	return new Promise((resolve, reject) => {
// 		const stmt= client.prepare('INSERT INTO users VALUES (?, ?)')
// 		stmt.run(user, securePass)
// 		stmt.finalize(err => {
// 			if(err) return reject(err)
// 			resolve()
// 		})
// 	})
// }

// // exporta la funcion createDb para poder usada desde el main
// module.exports = {
// 	createDb
// }

// // // aplica con el each una consulta por cada registro de la tabla u sers
// // async function listUsers () {
// // 	return new Promise((resolve, reject) => {
// // 		const users = []
// // 		client.each('SELECT user FROM users', (err, rows) => {
// // 			if(err) return reject(err)
// // 			users.push(rows)
// // 		}, (err, count) => {
// // 			if(err) return reject(err)
// // 			resolve({ count, users })
// // 		})
// // 	})
// // }

// // async function getStats (user, game) {
// // 	return new Promise((resolve, reject) => {
// // 		const stmt =client.prepare(`
// // 			SELECT name, value FROM secrets 
// // 			WHERE user = ? AND name = ?`)
// // 		stmt.get(user, name, (err, row)=> {
// // 			if(err) return reject(err)
// // 			stmt.finalize(() => {	
// // 			resolve(row)})
// // 		})
// // 	})
// // } 

// // async function createStats (user, name, value) {
// // 	return new Promise((resolve, reject) => {
// // 		const stmt = client.prepare('INSERT INTO secrets VALUES (?, ?, ?)')
		
// // 		stmt.run(user, name, value, err => {
// // 			if(err) return reject(err)
// // 			resolve()
// // 		}
// // 		)
// // 		// stmt.run(user, name, value)
// // 		// stmt.finalize(err => {
// // 		// 	if(err) return reject(err)
// // 		// 	resolve()
// // 		// })
// // 	})
// // }


// // async function createSecret (user, name, value) {
// // 	return new Promise((resolve, reject) => {
// // 		const stmt = client.prepare('INSERT INTO secrets VALUES (?, ?, ?)')
		
// // 		stmt.run(user, name, value, err => {
// // 			if(err) return reject(err)
// // 			resolve()
// // 		}
// // 		)
// // 		// stmt.run(user, name, value)
// // 		// stmt.finalize(err => {
// // 		// 	if(err) return reject(err)
// // 		// 	resolve()
// // 		// })
// // 	})
// // }


// // async function li					// createStats,
// 					// getStats
// 					// createSecret,
// 					// listSecrets,
// 					// getSecret,
// 					// updateSecret,
// 					// deleteSecretstSecrets (user) {
// // 	return new Promise((resolve, reject) => {
// // 		const stmt =client.prepare('SELECT name FROM secrets WHERE user = ?')
// // 		stmt.all(user, (err, rows) => {
// // 			if(err) return reject(err)
// // 			resolve(rows)
// // 		})
// // 	})
// // }

// // async function getSecret (user, name) {
// // 	return new Promise((resolve, reject) => {
// // 		const stmt =client.prepare(`
// // 			SELECT name, value FROM secrets 
// // 			WHERE user = ? AND name = ?`)
// // 		stmt.get(user, name, (err, row)=> {
// // 			if(err) return reject(err)
// // 			stmt.finalize(() => {	
// // 			resolve(row)})
// // 		})
// // 	})
// // } 

// // async function updateSecret (user, name, value) {
// // 	return new Promise((resolve, reject) => {
// // 	  const stmt = client.prepare(
// // 		`
// // 		UPDATE secrets
// // 		SET value = ? 
// // 		WHERE user = ? AND name = ?
// // 		`
// // 	  )
// // 	  stmt.run(value, user, name, err => {
// // 		if (err) return reject(err) 
  
// // 		resolve()
// // 	  })
// // 	})
// //   }
  
// //   async function deleteSecret (user, name) {
// // 	return new Promise((resolve, reject) => {
// // 	  const stmt = client.prepare(
// // 		`
// // 		DELETE FROM secrets WHERE user = ? AND name = ?
// // 		`
// // 	  )
// // 	  stmt.run(user, name, err => {
// // 		if (err) return reject(err)
  
// // 		resolve()
// // 	  })
// // 	})
// //   }
  



// 					// listUsers,
// 					// createStats,
// 					// getStats
// 					// createSecret,
// 					// listSecrets,
// 					// getSecret,
// 					// updateSecret,
// 					// deleteSecret