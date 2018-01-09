'use strict';

/**
 * @file Manages the junction table between users and groups
 * @see {@link module:eventUser}
 */

/**
 * Creates table 'EventUser'
 * @module eventUser
 * @implements {up}
 * @implements {down}
 */

module.exports = {

    /**
     * Sets table 'EventUser'.
     *
     * @function up
     *
     * @param {Object} queryInterface - A query interface.
     * @param {Object} Sequelize - The Sequelize object.
     *
     * @implements {id}
     * @implements {userId}
     * @implements {eventId}
     *
     * @returns {Promise} The promise to create a table.
     *
     */
    up: (queryInterface, Sequelize) => queryInterface.createTable('EventUser', {

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
         * The user id
         * @var {INTEGER} userId
         */
        userId: {
            allowNull: false,
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            references: {
                model: 'Users',
                key: 'id'
            }

        },

        /**
         * The event id
         * @var {INTEGER} eventId
         */
        eventId: {
            allowNull: false,
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            references: {
                model: 'Events',
                key: 'id'
            }
        }
    }),

    /**
     * Resets the table 'EventUser'.
     *
     * @function down
     * @param {Object} queryInterface - A query interface.
     * @returns {Promise} The promise to drop a table.
     */
    down: (queryInterface) => queryInterface.dropTable('EventUser')
};
