'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('UserSecrets', 'resetToken', {
      allowNull: true,
      type: Sequelize.STRING,
      defaultValue: ""
    });

    await queryInterface.addColumn('UserSecrets', 'resetTokenDate', {
      allowNull: true,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    })
  
    return true;
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('UserSecrets', 'resetToken');
    return true;
  }
};
