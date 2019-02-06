'use strict';

/**
 * @file
 * @see {@link module:addDateToEvent}
 */

/**
 * @module addDate
 * @implements {up}
 * @implements {down}
 */

module.exports = {

    /**
     * Adds columns to 'Events'.
     *
     * @function up
     *
     * @param {Object} queryInterface - A query interface.
     * @param {Object} Sequelize - The Sequelize object.
     *
     * @returns {Promise} The promise to create a table.
     *
     */
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Events', 'startDate', {
            allowNull: false,
            type: Sequelize.DATE
        });

        await queryInterface.addColumn('Events', 'endDate', {
            allowNull: true,
            type: Sequelize.DATE
        });

        return true;
    },

    /**
     * Removes columns from 'Events'.
     *
     * @function down
     * @param {Object} queryInterface - A query interface.
     * @returns {Promise} The promise to remove a column.
     */
    down: async (queryInterface) => {
        await queryInterface.removeColumn('Events', 'startDate');
        await queryInterface.removeColumn('Events', 'endDate');

        return true;
    }
};
