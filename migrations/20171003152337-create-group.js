'use strict';

/**
 * Creates table 'Groups'
 * Groups only have a name and an id
 * name is a STRING
 */

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
            type: Sequelize.STRING,
            unique: true
        }
    }),
    down: (queryInterface) => queryInterface.dropTable('Groups')
};
