'use strict';
const {	Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class User extends Model {
		static associate(models) {
		}
	}
	User.init({
		username: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		password: {
			type: DataTypes.STRING,
			allowNull: true
		},
		googleId: {
			type: DataTypes.STRING,
			allowNull: true,
			unique: true
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		avatarPath: {
			type: DataTypes.STRING,
			defaultValue: 'https://localhost:8443/back//images/default-avatar.png'
		},
		lastLogin: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW
		},
		lastLogout: {
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: null
		},
		refreshToken: {
			type: DataTypes.STRING,
			allowNull: true,
			defaultValue: null
		}
	}, {
	sequelize,
	modelName: 'User',
	underscored: true,
	tableName: 'users',
	freezeTableName: true,
	});
	return User;
};
