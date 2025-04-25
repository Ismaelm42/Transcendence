'use strict';
const { Model, Op } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class Friend extends Model {
		static associate(models) {
			Friend.belongsTo(models.User, {
				as: 'User',
				foreignKey: 'userId',
				onDelete: 'CASCADE',
			});
			Friend.belongsTo(models.User, {
				as: 'FriendUser',
				foreignKey: 'friendId',
				onDelete: 'CASCADE',
			});
		}
	}
	Friend.init({
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		friendId: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		status: {
			type: DataTypes.ENUM('pending', 'accepted', 'blocked'),
			defaultValue: 'pending',
		},
		wasFriend: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
	}, {
		sequelize,
		modelName: 'Friend',
		underscored: true,
		tableName: 'friends',
		freezeTableName: true,
		hooks: {
			async beforeCreate(friend, options) {
				const parsedUserId = parseInt(friend.userId);
				const parsedFriendId = parseInt(friend.friendId);

				if (parsedUserId === parsedFriendId) {
					throw new Error("A user cannot friend themselves.");
				}
				const existing = await sequelize.models.Friend.findOne({
					where: {
						[Op.or]: [
							{ userId: parsedUserId, friendId: parsedFriendId },
							{ userId: parsedFriendId, friendId: parsedUserId }
						]
					}
				});
				if (existing) {
					throw new Error("A friendship already exists between these users.");
				}
			}
		}
	});
	return Friend;
};

