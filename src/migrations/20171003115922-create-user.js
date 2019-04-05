'use strict';

module.exports = {

    up: (queryInterface, Sequelize) => queryInterface.createTable('Users', {

        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        username: {
            allowNull: false,
            type: Sequelize.STRING,
            unique: true
        },

        password: {
            allowNull: false,
            type: Sequelize.STRING
        },

        email: {
            allowNull: false,
            type: Sequelize.STRING,
            unique: true
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

    down: (queryInterface) => queryInterface.dropTable('Users')
};
