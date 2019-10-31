'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Posts', 'pinned', {
      allowNull: true,
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

    return true;
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Posts', 'pinned');
    return true;
  }
};
