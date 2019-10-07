'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => 
    queryInterface.addColumn('Data', 'creatorId', {
      allowNull: true,
      type: Sequelize.INTEGER
    }),

  down: (queryInterface, Sequelize) => queryInterface.removeColumn('Data', 'creatorId')
};
