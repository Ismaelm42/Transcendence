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
			defaultValue: null
		},
		playerscount: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 4
		},
		config: {
			type: DataTypes.JSONB,
			allowNull: true,
			defaultValue: {}
		},
		users: {
			type: DataTypes.ARRAY(DataTypes.INTEGER),
			allowNull: true,
		},
		games: {
			type: DataTypes.ARRAY(DataTypes.INTEGER),
			allowNull: true,	
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
		}
	}, {
	sequelize,
	modelName: 'Tournamentlog',
	underscored: true,
	tableName: 'tournamentlogs',
	freezeTableName: true,
	});
	return Tournamentlog;
};
