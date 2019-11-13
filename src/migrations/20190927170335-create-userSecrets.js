'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.createTable('UserSecrets', {

        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        password: {
            allowNull: false,
            type: Sequelize.STRING
        },

        userId: {
          allowNull: false,
          type: Sequelize.INTEGER
        },

        createdAt: {
            allowNull: false,
            type: Sequelize.DATE
        },

        updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
        }
      })
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.dropTable('UserSecrets')
    ]);
  }
};
