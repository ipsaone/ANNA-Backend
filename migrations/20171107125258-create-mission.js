'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.createTable('Missions', {
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
        markdown: {
            allowNull: true,
            type: Sequelize.STRING
        },
        description: {
            allowNull: true,
            type: Sequelize.STRING
        },
        budgetAssigned: {
            allowNull: true,
            type: Sequelize.INTEGER
        },
        budgetUsed: {
            allowNull: true,
            type: Sequelize.INTEGER
        },
        groupId: {
            allowNull: false,
            type: Sequelize.INTEGER,
            references: {
                model: 'Groups',
                key: 'id',
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE'
            }
        },
        leaderId: {
            allowNull: false,
            type: Sequelize.INTEGER,
            references: {
                model: 'Users',
                key: 'id',
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE'
            }
        }
    }),

    down: (queryInterface, Sequelize) => {
        queryInterface.dropTable('Missions');
    }
};
