'use strict';

/**
 * @file
 * @see {@link module:addDeletedAtToLogs}
 */

/**
 * @module addDeletedAt
 * @implements {up}
 * @implements {down}
 */

module.exports = {

    /**
     * Adds columns to 'Logs'.
     *
     * @function up
     *
     * @param {Object} queryInterface - A query interface.
     * @param {Object} Sequelize - The Sequelize object.
     *
     * @returns {Promise} The promise to create a table.
     *
     */
    up: (queryInterface, Sequelize) => 
        queryInterface.addColumn('Logs', 'deletedAt', {
            allowNull: true,
            type: Sequelize.DATE
        })
    ,

    /**
     * Removes columns from 'Logs'.
     *
     * @function down
     * @param {Object} queryInterface - A query interface.
     * @returns {Promise} The promise to remove a column.
     */
    down: (queryInterface) => 
        queryInterface.removeColumn('Logs', 'deletedAt')
    
};
