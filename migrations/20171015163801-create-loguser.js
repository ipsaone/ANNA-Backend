'use strict';

/**
 * @file Manages the junction table between logs and users
 * @see {@link module:createLogUser}
 */

/**
 * @module createLogUser
 * @implements {up}
 * @implements {down}
 */
 
module.exports = {

    /**
     * Sets table 'LogUser'.
     *
     * @function up
     * @param {Object} queryInterface - A query interface.
     * @param {Object} Sequelize - The Sequelize object.
     * @implements {id}
     * @implements {logId}
     * @implements {userId}
     *
     * @returns {Promise} The promise to create a table.
     *
     */
    up: (queryInterface, Sequelize) => queryInterface.createTable('LogUser', {

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
         * The id of the log
         * @var {INTEGER} logId
         */
        logId: {
            allowNull: false,
            type: Sequelize.INTEGER,
            onDelete: 'RESTRICT',
            references: {
                model: 'Logs',
                key: 'id'
            }
        },

        /**
         * The id of the user
         * @var {INTEGER} userId
         */
        userId: {
            allowNull: false,
            type: Sequelize.INTEGER,
            onDelete: 'RESTRICT',
            references: {
                model: 'Users',
                key: 'id'
            }
        }
    }),

    /**
     * Resets table 'LogUser'.
     *
     * @function down
     * @param {Object} queryInterface - A query interface.
     * @returns {Promise} The promise to drop a table.
     */
    down: (queryInterface) => queryInterface.dropTable('LogUser')
};
