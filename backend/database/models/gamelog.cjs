'use strict';
const {	Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class Gamelog extends Model {
		static associate(models) {
		}
	}
	Gamelog.init({
		user1: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		user2: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		winner: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		loser: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		duration: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		game_id: {
			type: DataTypes.STRING,
			allowNull: true,
			defaultValue: null
		},
		tournament_id: {
			type: DataTypes.STRING,
			allowNull: true,
			defaultValue: null
		}
	}, {
	sequelize,
	modelName: 'Gamelog',
	underscored: true,
	tableName: 'gamelogs',
	freezeTableName: true,
	});
	return Gamelog;
};
