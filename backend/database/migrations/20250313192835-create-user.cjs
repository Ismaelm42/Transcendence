/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Users', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			username: {
				type: Sequelize.STRING,
				allowNull: false,
				unique: true
			},
			tournament_username: {
				type: Sequelize.STRING,
				allowNull: true,
				unique: true,
			},
			password: {
				type: Sequelize.STRING,
				allowNull: true
			},
			google_id: {
				type: Sequelize.STRING,
				allowNull: true,
				unique: true
			},
			email: {
				type: Sequelize.STRING,
				allowNull: false,
				unique: true
			},
			avatar_path: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			last_login: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.NOW
			},
			last_logout: {
				type: Sequelize.DATE,
				allowNull: true,
				defaultValue: null
			},
			refresh_token: {
				type: Sequelize.STRING,
				allowNull: true,
				defaultValue: null
			},	
			created_at: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.NOW
			},
			updated_at: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.NOW
			}
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('Users');
	}
};

// docker exec -it backend bash && cd ./database && npx sequelize-cli db:migrate
// docker exec -it backend bash && cd ./database && npx sequelize-cli db:migrate:undo
