'use strict';

/**
 * @file
 * @see {@link module:addHiddenToData}
 */

/**
 * @module addHidden
 * @implements {up}
 * @implements {down}
 */

module.exports = {

    /**
     * Adds columns to 'Data'.
     *
     * @function up
     *
     * @param {Object} queryInterface - A query interface.
     * @param {Object} Sequelize - The Sequelize object.
     *
     * @returns {Promise} The promise to create a table.
     *
     */
    up: (queryInterface, Sequelize) => {
        queryInterface.addColumn('Data', 'hidden', {
            allowNull: false,
            type: Sequelize.BOOLEAN,
            defaultValue: false
        });
    },

    /**
     * Removes columns from 'Data'.
     *
     * @function down
     * @param {Object} queryInterface - A query interface.
     * @returns {Promise} The promise to remove a column.
     */
    down: (queryInterface) => {
        queryInterface.removeColumn('Data', 'hidden');
    }
};
