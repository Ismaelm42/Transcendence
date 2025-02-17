import { Model, DataTypes } from 'sequelize';

'use strict';

export default (sequelize) => {
	class Visitor extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
		}
	}
	Visitor.init({
		user_id: DataTypes.INTEGER,
		last_login: DataTypes.DATE,
		last_logout: DataTypes.DATE,
	}, {
		sequelize,
		modelName: 'Visitor',
		underscored: true,
		tableName: 'visitors',
		freezeTableName: true,
	});
	return Visitor;
};
