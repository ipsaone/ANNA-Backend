'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => 
    queryInterface.addColumn('Events', 'creatorId', {
      allowNull: true,
      type: Sequelize.INTEGER
    }),

  down: (queryInterface, Sequelize) => queryInterface.removeColumn('Events', 'creatorId')
};
