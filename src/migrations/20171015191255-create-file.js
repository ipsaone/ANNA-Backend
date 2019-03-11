'use strict';

module.exports = {

    up: (queryInterface, Sequelize) => queryInterface.createTable('Files', {

        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        isDir: {
            allowNull: false,
            type: Sequelize.BOOLEAN
        },

        createdAt: {
            allowNull: false,
            type: Sequelize.DATE
        },

        updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
        },

        deletedAt: {
            allowNull: true,
            type: Sequelize.DATE
        }
    }),

    down: (queryInterface) => queryInterface.dropTable('Files')
};
