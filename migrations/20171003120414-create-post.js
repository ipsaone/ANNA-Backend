'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.createTable('Posts', {
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
        markdown: {
            allowNull: false,
            type: Sequelize.TEXT
        },
        content: {
            allowNull: false,
            type: Sequelize.TEXT
        },
        authorId: {
            allowNull: false,
            type: Sequelize.INTEGER,
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        published: {
            allowNull: false,
            defaultValue: false,
            type: Sequelize.BOOLEAN
        },
        publishedAt: {type: Sequelize.DATE},
        createdAt: {
            allowNull: false,
            type: Sequelize.DATE
        },
        updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
        }
    }),
    down: (queryInterface) => queryInterface.dropTable('Posts')
};
