'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
   return queryInterface.createTable('Missions', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    }
    name: {allowNull: false, type: DataTypes.STRING},
    markdown: {allowNull: true, type: DataTypes.STRING},
    description: {allowNull: true, type: DataTypes.STRING},
    budgetAssigned: {allowNull: true, type: DataTypes.INTEGER},
    budgetUsed: {allowNull: true, type: DataTypes.INTEGER},
    groupId: {allowNull: false, type: DataTypes.INTEGER, references: {model: 'Groups', key: 'id'}},
    leaderId: {allowNull: false, type: DataTypes.INTEGER, references: {model: 'Users', key: 'id'}},
   });
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.dropTable('Missions')
  }
};
