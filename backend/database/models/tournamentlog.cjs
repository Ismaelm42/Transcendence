'use strict';
const {	Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class Tournamentlog extends Model {
		static associate(models) {
		}
	}
	Tournamentlog.init({
		tournamentId: {
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: -42,
			unique: true // Agrega la condición de único
		},
		playerscount: {
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: 4
		},
		config: {
			type: DataTypes.JSONB,
			allowNull: true,
			defaultValue: {}
		},
		users: {
			type: DataTypes.JSONB,
			allowNull: true,
			defaultValue: {}
		},
		gamesData: {
			type: DataTypes.JSONB,
			allowNull: true,
			defaultValue: {}
		},
		winner: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW
		},
	}, {
	sequelize,
	modelName: 'Tournamentlog',
	underscored: true,
	tableName: 'tournamentlogs',
	freezeTableName: true,
	});
	return Tournamentlog;
};
