'use strict';

/**
 * @file Allows to add or remove the column 'maxRegistered' to events
 * @see {@link module:addMaxRegisteredToEvent}
 */

/**
 * @module addMaxRegisteredToEvent
 * @implements {up}
 * @implements {down}
 */

module.exports = {

    /**
     * Adds column 'maxRegistered' to table 'Events'.
     *
     * @function up
     *
     * @param {Object} queryInterface - A query interface.
     * @param {Object} Sequelize - The Sequelize object.
     *
     * @returns {Promise} The promise to add a column.
     *
     */
    up: (queryInterface, Sequelize) => 
        queryInterface.addColumn('Events', 'maxRegistered', {
            allowNull: true,
            defaultValue: Sequelize.NULL,
            type: Sequelize.INTEGER
        })
    ,

    /**
     * Removes column 'maxRegistered' from table 'Events'.
     *
     * @function down
     *
     * @param {Object} queryInterface - A query interface.
     *
     * @returns {Promise} The promise to remove a column.
     *
     */
    down: (queryInterface) => 
        queryInterface.removeColumn('Events', 'maxRegistered')
    
};
