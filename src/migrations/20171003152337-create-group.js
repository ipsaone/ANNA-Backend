'use strict';

/**
 * @file Manages the table containing all groups in the database
 * @see {@link module:createGroups}
 */

/**
 * Creates table 'Groups'
 * @module createGroups
 * @implements {up}
 * @implements {down}
 */

module.exports = {

    /**
     * Sets table 'Groups'.
     *
     * @function up
     *
     * @implements {id}
     * @implements {name}
     *
     * @param {Object} queryInterface - A query interface.
     * @param {Object} Sequelize - The Sequelize object.
     *
     * @returns {Promise} The promise to create a table.
     *
     */
    up: (queryInterface, Sequelize) => queryInterface.createTable('Groups', {

        /**
         * The id of the group
         * @var {INTEGER} id
         */
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        /**
         * The name of the group
         * @var {STRING} name
         */
        name: {
            allowNull: false,
            type: Sequelize.STRING,
            unique: true
        }
    }),

    /**
     * Resets table 'Groups'.
     *
     * @function down
     * @param {Object} queryInterface - A query interface.
     * @returns {Promise} The promise to drop a table.
     */
    down: (queryInterface) => queryInterface.dropTable('Groups')
};
