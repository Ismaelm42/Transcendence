'use strict';
/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('users', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    username: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE
    }
  });

  await queryInterface.createTable('stats', {
    user_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    max_wins_in_row: {
      type: Sequelize.INTEGER
    },
    max_losses_in_row: {
      type: Sequelize.INTEGER
    },
    wins: {
      type: Sequelize.INTEGER
    },
    losses: {
      type: Sequelize.INTEGER
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE
    }
  });

  await queryInterface.createTable('visitors', {
    user_id: {
      allowNull: false,
      type: Sequelize.INTEGER
    },
    google_id: {
      type: Sequelize.STRING
    },
    last_login: {
      allowNull: false,
      type: Sequelize.DATE
    },
    last_logout: {
      type: Sequelize.INTEGER
    }
  });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('visitors');
  await queryInterface.dropTable('stats');
  await queryInterface.dropTable('users');
};