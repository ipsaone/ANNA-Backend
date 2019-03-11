'use strict';

module.exports = {

    up: (queryInterface, Sequelize) => queryInterface.createTable('EventUser', {

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

        eventId: {
            allowNull: false,
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            references: {
                model: 'Events',
                key: 'id'
            }
        }
    }),

    down: (queryInterface) => queryInterface.dropTable('EventUser')
};
