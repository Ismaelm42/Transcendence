/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Tournamentlogs', {
			tournamentId: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				unique: true,
				type: Sequelize.INTEGER
			},
			playerscount: {
				type: Sequelize.INTEGER,
				allowNull: true,
				defaultValue: 4
			},
			config: {
				type: Sequelize.JSONB,
				allowNull: true,
				defaultValue: {}
			},
			users: {
				type: Sequelize.JSONB,
				allowNull: true,
				defaultValue: {}
			},
			gamesData: {
				type: Sequelize.JSONB,
				allowNull: true,
				defaultValue: {}
			},
			winner: {
				type: Sequelize.INTEGER,
				allowNull: true,
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
		await queryInterface.dropTable('Tournamentlogs');
	}
};

// docker exec -it backend bash && cd ./database && npx sequelize-cli db:migrate
// docker exec -it backend bash && cd ./database && npx sequelize-cli db:migrate:undo
