import { Model, DataTypes } from 'sequelize';

'use strict';

export default (sequelize) => {
	class Stat extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
		}
	}
	Stat.init({
		user_id: DataTypes.STRING,
		max_wins_in_row: DataTypes.INTEGER,
		max_losses_in_row: DataTypes.INTEGER,
		wins: DataTypes.INTEGER,
		losses: DataTypes.INTEGER,
	}, {
		sequelize,
		modelName: 'Stat',
		underscored: true,
		tableName: 'stats',
		freezeTableName: true,
	});
	return Stat;
};
