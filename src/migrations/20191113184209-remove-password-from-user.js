'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => 
    queryInterface.removeColumn('Users', 'password'),

  down: (queryInterface, Sequelize) => 
    queryInterface.addColumn('Users', 'password', {
      allowNull: false,
      type: Sequelize.STRING
    })
  
};
