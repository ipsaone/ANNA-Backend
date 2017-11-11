'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
   return queryInterface.createTable('Tasks', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    name: {allowNull: false, type: Sequelize.STRING},
    done: {allowNull: false, type: Sequelize.BOOLEAN, defaultValue: false}
   });
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.dropTable('Tasks')
  }
};
