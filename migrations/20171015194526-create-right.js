'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.createTable('Rights', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        groupWrite: {
            defaultValue: false,
            type: Sequelize.BOOLEAN
        },
        groupRead: {
            defaultValue: false,
            type: Sequelize.BOOLEAN
        },
        ownerWrite: {
            defaultValue: false,
            type: Sequelize.BOOLEAN
        },
        ownerRead: {
            defaultValue: false,
            type: Sequelize.BOOLEAN
        },
        allWrite: {
            defaultValue: false,
            type: Sequelize.BOOLEAN
        },
        allRead: {
            defaultValue: false,
            type: Sequelize.BOOLEAN
        }
    }),
    down: (queryInterface, Sequelize) => queryInterface.dropTable('Rights')
};
