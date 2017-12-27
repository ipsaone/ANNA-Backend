'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.createTable('LogUser', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        logId: {
            allowNull: false,
            type: Sequelize.INTEGER,
            onDelete: 'RESTRICT',
            references: {
                model: 'Logs',
                key: 'id'
            }
        },
        userId: {
            allowNull: false,
            type: Sequelize.INTEGER,
            onDelete: 'RESTRICT',
            references: {
                model: 'Users',
                key: 'id'
            }
        }
    }),

    down: (queryInterface) => queryInterface.dropTable('LogUser')
};
