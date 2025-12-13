'use strict';
const {	Model } = require('sequelize');

const avatarUrls = Array.from({ length: 20 }, (_, i) => `/back/images/avatar-${i + 1}.png`);

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
		tournamentUsername: {
			type: DataTypes.STRING,
			allowNull: true,
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
			allowNull: true,
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
		},
		chessRating: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 1200
		}
	}, {
	sequelize,
	modelName: 'User',
	underscored: true,
	tableName: 'users',
	freezeTableName: true,
	hooks: {
		beforeCreate: (user) => {
			if (!user.avatarPath) {
				const randomIndex = Math.floor(Math.random() * avatarUrls.length);
				user.avatarPath = avatarUrls[randomIndex];
			}
			if (!user.tournamentUsername) {
				user.tournamentUsername = user.username;
			}
		}
	}
	});
	return User;
};
