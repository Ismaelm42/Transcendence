/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Friends', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			user_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: 'users',
					key: 'id'
				},
				onDelete: 'CASCADE'
			},
			friend_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: 'users',
					key: 'id'
				},
				onDelete: 'CASCADE'
			},
			status: {
				type: Sequelize.ENUM('pending', 'accepted', 'blocked'),
				defaultValue: 'pending'
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
    await queryInterface.dropTable('Friends');
  }
};

// docker exec -it backend bash && cd ./database && npx sequelize-cli db:migrate
// docker exec -it backend bash && cd ./database && npx sequelize-cli db:migrate:undo
