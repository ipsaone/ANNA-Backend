'use strict';

module.exports = {

    up: (queryInterface, Sequelize) => queryInterface.createTable('FileLog', {

        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        fileId: {
            allowNull: false,
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: 'Files',
                key: 'id'
            }
        },

        logId: {
            allowNull: false,
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: 'Logs',
                key: 'id'
            }
        }
    }),

    down: (queryInterface) => queryInterface.dropTable('FileLog')
};
