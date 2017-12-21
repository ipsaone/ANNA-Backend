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
        },
        ownerId: {
            allowNull: false,
            type: Sequelize.INTEGER,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        groupId: {
            allowNull: false,
            type: Sequelize.INTEGER,
            references: {
                model: 'Groups',
                key: 'id'
            }
        }
    }),
    down: (queryInterface) => queryInterface.dropTable('Files')
};
