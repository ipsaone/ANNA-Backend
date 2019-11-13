'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => 
    queryInterface.addColumn('Data', 'creatorId', {
      allowNull: false,
      type: Sequelize.INTEGER
    }),

  down: (queryInterface, Sequelize) => queryInterface.removeColumn('Data', 'creatorId')
};
