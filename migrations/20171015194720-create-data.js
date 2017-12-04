'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.createTable('Data', {
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
        type: {
            allowNull: true,
            type: Sequelize.STRING
        },
        size: {
            allowNull: true,
            type: Sequelize.INTEGER
        },
        fileId: {
            allowNull: false,
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            references: {
                model: 'Files',
                key: 'id'
            }
        },
        dirId: {
            allowNull: false,
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            OnUpdate: 'CASCADE',
            references: {
                model: 'Files',
                key: 'id'
            }
        },
        rightsId: {
            allowNull: true,
            type: Sequelize.INTEGER,
            onDelete: 'SET NULL',
            onUpdate: 'SET NULL',
            references: {
                model: 'Rights',
                key: 'id'
            }
        },
        ownerId: {
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
            allowNull: true,
            type: Sequelize.INTEGER,
            onDelete: 'SET NULL',
            onUpdate: 'SET NULL',
            references: {
                model: 'Groups',
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
    down: (queryInterface) => queryInterface.dropTable('Data')
};
