'use strict';

/**
 * @file
 * @see {@link module:addExistsToData}
 */

/**
 * Add or remove columns to 'Data'
 * @module addExistsToData
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
    up: (queryInterface, Sequelize) => 
        queryInterface.addColumn('Data', 'exists', {
            allowNull: false,
            defaultValue: true,
            type: Sequelize.BOOLEAN
        })
    ,

    /**
     * Removes columns to 'Data'.
     *
     * @function down
     * @param {Object} queryInterface - A query interface.
     * @returns {Promise} The promise to remove a column.
     */
    down: (queryInterface) => 
        queryInterface.removeColumn('Data', 'exists')
    
};
