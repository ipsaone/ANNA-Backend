'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Rights', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            groupWrite: {
                default: false,
                type: Sequelize.BOOLEAN
            },
            groupRead: {
                default: false,
                type: Sequelize.BOOLEAN
            },
            ownerWrite: {
                default: false,
                type: Sequelize.BOOLEAN
            },
            ownerRead: {
                default: false,
                type: Sequelize.BOOLEAN
            },
            allWrite: {
                default: false,
                type: Sequelize.BOOLEAN
            },
            allRead: {
                default: false,
                type: Sequelize.BOOLEAN
            }
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('Rights');
    }
};