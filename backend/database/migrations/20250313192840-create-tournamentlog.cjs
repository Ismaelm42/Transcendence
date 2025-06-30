/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Tournamentlogs', {
			tournamentId: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			playerscount: {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 4
			},
			config: {
				type: Sequelize.JSONB,
				allowNull: true,
				defaultValue: {}
			},
			users: {
				type: Sequelize.ARRAY(Sequelize.INTEGER),
				allowNull: false
			},
			games: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			winner: {
				type: Sequelize.INTEGER,
				allowNull: false,
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
