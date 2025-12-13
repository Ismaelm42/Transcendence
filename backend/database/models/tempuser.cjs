'use strict';
const {	Model } = require('sequelize');

const avatarUrls = Array.from({ length: 20 }, (_, i) => `/back/images/avatar-${i + 1}.png`);

module.exports = (sequelize, DataTypes) => {
	class User extends Model {
		static associate(models) {
		}
	}
	User.init({
		tournamentId: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		tournamentUsername: {
			type: DataTypes.STRING,
			allowNull: true,
			unique: true
		},
		avatarPath: {
			type: DataTypes.STRING,
			allowNull: true,
		}
	}, {
	sequelize,
	modelName: 'Tempuser',
	underscored: true,
	tableName: 'Tempusers',
	freezeTableName: true,
	hooks: {
		beforeCreate: (user) => {
			if (!user.avatarPath) {
				const randomIndex = Math.floor(Math.random() * avatarUrls.length);
				user.avatarPath = avatarUrls[randomIndex];
			}
		}
	}
	});
	return User;
};
