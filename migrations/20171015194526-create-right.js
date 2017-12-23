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
     */
    up: (queryInterface, Sequelize) => queryInterface.createTable('Rights', {

        /**
         * @var id
         */
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        /**
         *
         * @var groupWrite
         */
        groupWrite: {
            defaultValue: false,
            type: Sequelize.BOOLEAN
        },

        /**
         *
         * @var groupRead
         */
        groupRead: {
            defaultValue: false,
            type: Sequelize.BOOLEAN
        },

        /**
         *
         * @var ownerWrite
         */
        ownerWrite: {
            defaultValue: false,
            type: Sequelize.BOOLEAN
        },

        /**
         *
         * @var ownerRead
         */
        ownerRead: {
            defaultValue: false,
            type: Sequelize.BOOLEAN
        },

        /**
         *
         * @var allWrite
         */
        allWrite: {
            defaultValue: false,
            type: Sequelize.BOOLEAN
        },

        /**
         *
         * @var allRead
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
     */
    down: (queryInterface) => queryInterface.dropTable('Rights')
};
