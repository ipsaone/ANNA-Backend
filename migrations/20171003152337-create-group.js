'use strict';

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
     * @implements {id}
     * @implements {name}
     * @param {Object} queryInterface - A query interface.
     * @param {Object} Sequelize - The Sequelize object.
     * @returns {Promise} The promise to drop a table.
     */
    up: (queryInterface, Sequelize) => queryInterface.createTable('Groups', {

        /**
         * The id of the group
         * @var id
         */
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        /**
         * The name of the group
         * @var name
         */
        name: {
            allowNull: false,
            type: Sequelize.STRING
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
