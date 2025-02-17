import { Model, DataTypes } from 'sequelize';

'use strict';

export default (sequelize) => {
	class User extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
		}
	}
	User.init({
		username: DataTypes.STRING,
		password: DataTypes.STRING
	}, {
		sequelize,
		modelName: 'User',
		underscored: true,
		tableName: 'users',
		freezeTableName: true,
	});
	return User;
};
