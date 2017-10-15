'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Logs', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            title: {
                allowNull: false,
                type: Sequelize.STRING
            },
            content: {
                allowNull: false,
                type: Sequelize.TEXT
            },
            authorId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                onDelete: 'CASCADE',
                references: {
                    model: 'Users',
                    key: 'id'
                },
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('Logs');
    }
};