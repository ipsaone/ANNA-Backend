'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Data', {
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
            fileId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'File',
                    key: 'id'
                }
            },
            dirId: {
                allowNull: false,
                default: 0,
                type: Sequelize.INTEGER,
                references: {
                    model: 'File',
                    key: 'id'
                }
            },
            rightsId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                onDelete: 'CASCADE',
                references: {
                    model: 'Rights',
                    key: 'id'
                }
            },
            ownerId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                onDelete: 'CASCADE',
                references: {
                    model: 'Users',
                    key: 'id'
                },
            },
            groupId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                onDelete: 'CASCADE',
                references: {
                    model: 'Groups',
                    key: 'id'
                },
            },
            deleted: {
                allowNull: false,
                default: false,
                type: Sequelize.BOOLEAN
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
        return queryInterface.dropTable('Data');
    }
};