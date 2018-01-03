'use strict';

/**
 * Creates table 'UserGroup'
 *
 */

module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.createTable('UserMission', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        userId: {
            allowNull: false,
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            references: {
                model: 'Users',
                key: 'id'
            }

        },
        missionId: {
            allowNull: false,
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            references: {
                model: 'Missions',
                key: 'id'
            }
        }
    }),

    down: (queryInterface) => queryInterface.dropTable('UserMission')
};
