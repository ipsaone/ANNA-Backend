'use strict';

module.exports = {

    up: (queryInterface, Sequelize) => queryInterface.createTable('Logs', {

        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        title: {
            allowNull: false,
            type: Sequelize.STRING,
            unique: true
        },

        markdown: {
            allowNull: false,
            type: Sequelize.TEXT
        },

        content: {
            allowNull: false,
            type: Sequelize.TEXT
        },

        authorId: {
            allowNull: true,
            type: Sequelize.INTEGER,
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
            references: {
                model: 'Users',
                key: 'id'
            }
        },

        createdAt: {
            allowNull: false,
            type: Sequelize.DATE
        },

        updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
        }
    }),

    down: (queryInterface) => queryInterface.dropTable('Logs')
};
