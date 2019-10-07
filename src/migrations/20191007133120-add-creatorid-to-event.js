'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => 
    queryInterface.addColumn('Event', 'creatorId', {
      allowNull: true,
      type: Sequelize.INTEGER
    }),

  down: (queryInterface, Sequelize) => queryInterface.removeColumn('Event', 'creatorId')
};
