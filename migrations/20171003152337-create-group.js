'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.createTable('Groups', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        name: {
            allowNull: false,
            type: Sequelize.STRING
        }
    }),
    down: (queryInterface, Sequelize) => queryInterface.dropTable('Groups')
};
