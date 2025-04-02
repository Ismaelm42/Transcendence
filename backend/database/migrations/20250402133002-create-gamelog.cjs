/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Gamelogs', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			user1: {
				type: Sequelize.INTEGER,
				allowNull: false
			},
			user2: {
				type: Sequelize.INTEGER,
				allowNull: false
			},
			winner: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			loser: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			duration: {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 0
			},
			game_id: {
				type: Sequelize.STRING,
				allowNull: true,
				defaultValue: null
			},
			tournament_id: {
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
		await queryInterface.dropTable('Gamelogs');
	}
};
