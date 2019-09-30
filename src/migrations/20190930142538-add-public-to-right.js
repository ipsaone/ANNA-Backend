'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => 

    queryInterface.addColumn('Rights', 'public', {
      allowNull: true,
      defaultValue: false,
      type: Sequelize.BOOLEAN
  }),

  down: (queryInterface, Sequelize) => 
    queryInterface.removeColumn('Rights', 'public')
};
