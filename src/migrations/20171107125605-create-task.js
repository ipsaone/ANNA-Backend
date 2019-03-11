'use strict';

module.exports = {

    up: (queryInterface, Sequelize) => queryInterface.createTable('Tasks', {

        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        name: {
            allowNull: false,
            type: Sequelize.STRING
        },

        done: {
            allowNull: false,
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },

        missionId: {
            allowNull: false,
            type: Sequelize.INTEGER
        }
    }),

    down: (queryInterface) => 
        queryInterface.dropTable('Tasks')
    
};
