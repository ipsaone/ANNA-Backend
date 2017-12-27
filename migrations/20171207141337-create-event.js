'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.createTable('Events', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        name: {type: Sequelize.STRING},
        markdown: {
            allowNull: false,
            type: Sequelize.TEXT
        },
        content: {
            allowNull: false,
            type: Sequelize.TEXT
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
    down: (queryInterface) => queryInterface.dropTable('Events')
};
