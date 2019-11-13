'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => 
    queryInterface.addColumn('Data', 'sha1', {
      allowNull: true,
      type: Sequelize.STRING
    }),

  down: (queryInterface, Sequelize) => queryInterface.removeColumn('Data', 'sha1')
};
