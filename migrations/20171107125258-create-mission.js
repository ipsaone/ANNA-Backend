'use strict';

/**
 * @file Manages the table containing all missions and their description, budget, and assigned
 * @see {@link module:createMissions}
 */

/**
 * Creates table 'Missions'
 * @module createMissions
 * @implements {up}
 * @implements {down}
 */

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

    down: (queryInterface) => {
        queryInterface.dropTable('Missions');
    }
};
