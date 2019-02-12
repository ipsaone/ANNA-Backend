'use strict';

/**
 * @file Manages the table containing the rights of users and groups
 * @see {@link module:createRight}
 */

/**
 * Creates table 'Rights'
 * @module createRight
 * @implements {up}
 * @implements {down}
 */

module.exports = {

    /**
     * Sets table 'Rights'.
     *
     * @function up
     *
     * @param {Object} queryInterface - A query interface.
     * @param {Object} Sequelize - The Sequelize object.
     *
     * @implements {id}
     * @implements {groupWrite}
     * @implements {groupRead}
     * @implements {ownerWrite}
     * @implements {ownerRead}
     * @implements {allWrite}
     * @implements {allRead}
     *
     * @returns {Promise} The promise to create a table.
     *
     */
    up: (queryInterface, Sequelize) => queryInterface.createTable('Rights', {

        /**
         * @var {INTEGER} id
         */
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        /**
         * Shows the writing rights of a group
         * @var {BOOLEAN} groupWrite
         */
        groupWrite: {
            defaultValue: false,
            type: Sequelize.BOOLEAN
        },

        /**
         * Shows the reading rights of a group
         * @var {BOOLEAN} groupRead
         */
        groupRead: {
            defaultValue: false,
            type: Sequelize.BOOLEAN
        },

        /**
         * Shows the writinng rights of the owner
         * @var {BOOLEAN} ownerWrite
         */
        ownerWrite: {
            defaultValue: false,
            type: Sequelize.BOOLEAN
        },

        /**
         * Shows the reading rights of the owner
         * @var {BOOLEAN} ownerRead
         */
        ownerRead: {
            defaultValue: false,
            type: Sequelize.BOOLEAN
        },

        /**
         * Shows the writing rights of all users
         * @var {BOOLEAN} allWrite
         */
        allWrite: {
            defaultValue: false,
            type: Sequelize.BOOLEAN
        },

        /**
         * Shows the reading rights of all users
         * @var {BOOLEAN} allRead
         */
        allRead: {
            defaultValue: false,
            type: Sequelize.BOOLEAN
        }
    }),

    /**
     * Resets table 'Rights'.
     *
     * @function down
     * @param {Object} queryInterface - A query interface.
     * @returns {Promise} The promise to drop a table.
     */
    down: (queryInterface) => queryInterface.dropTable('Rights')
};
