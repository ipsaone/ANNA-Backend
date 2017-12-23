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
     */
    up: (queryInterface, Sequelize) => queryInterface.createTable('LogUser', {

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
         * The id of the log
         * @var logId
         */
        logId: {
            allowNull: false,
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: 'Logs',
                key: 'id'
            }
        },

        /**
         * The id of the user
         * @var userId
         */
        userId: {
            allowNull: false,
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
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
     */
    down: (queryInterface) => queryInterface.dropTable('LogUser')
};
