'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.createTable('Events', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        name: {
            allowNull: false,
            type: Sequelize.STRING,
            defaultValue: Sequelize.NULL,
            unique: true
        },
        markdown: {
            allowNull: false,
            type: Sequelize.TEXT,
            defaultValue: Sequelize.NULL
        },
        content: {
            allowNull: false,
            type: Sequelize.TEXT,
            defaultValue: Sequelize.NULL
        },
        createdAt: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        },
        updatedAt: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    }),
    down: (queryInterface) => queryInterface.dropTable('Events')
};
