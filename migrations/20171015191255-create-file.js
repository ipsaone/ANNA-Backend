'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Files', {
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
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('Files');
    }
};