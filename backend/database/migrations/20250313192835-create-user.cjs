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
				defaultValue: '/images/default-avatar.png'
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
