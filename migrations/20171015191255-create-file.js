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
        }
    }),
    down: (queryInterface) => queryInterface.dropTable('Files')
};
