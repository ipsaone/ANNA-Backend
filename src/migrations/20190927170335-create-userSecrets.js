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

        createdAt: {
            allowNull: false,
            type: Sequelize.DATE
        },

        updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
        }
      }),

      queryInterface.addColumn('Users', 'secretsId', {
        allowNull: false,
        type: Sequelize.INTEGER
      })
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.dropTable('UserSecrets'),
      queryInterface.removeColumn('Users', 'secretsId')
    ]);
  }
};
