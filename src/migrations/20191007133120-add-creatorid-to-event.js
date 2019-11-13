'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => 
    queryInterface.addColumn('Events', 'creatorId', {
      allowNull: false,
      type: Sequelize.INTEGER
    }),

  down: (queryInterface, Sequelize) => queryInterface.removeColumn('Events', 'creatorId')
};
