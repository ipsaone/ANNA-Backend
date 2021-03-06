'use strict';

module.exports = {

    up: (queryInterface, Sequelize) => queryInterface.createTable('UserGroup', {

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

        groupId: {
            allowNull: false,
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            references: {
                model: 'Groups',
                key: 'id'
            }
        }
    }),

    down: (queryInterface) => queryInterface.dropTable('UserGroup')
};
