'use strict';

/**
 * @file Manages the table containing all events in the database
 * @see {@link module:createEvents}
 */

/**
 * Creates table 'Events'
 * @module createEvents
 * @implements {up}
 * @implements {down}
 */

module.exports = {

    /**
     * Sets table 'Events'.
     *
     * @function up
     *
     * @param {Object} queryInterface - A query interface.
     * @param {Object} Sequelize - The Sequelize object.
     *
     * @implements {id}
     * @implements {name}
     * @implements {createdAt}
     * @implements {updatedAt}
     *
     * @returns {Promise} The promise to create a table.
     *
     */
    up: (queryInterface, Sequelize) => queryInterface.createTable('Events', {

        /**
         * The id of the event
         * @var {INTEGER} id
         */
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        /**
         * The name of the event
         * @var {STRING} name
         */
        name: {
            allowNull: false,
            type: Sequelize.STRING,
            defaultValue: Sequelize.NULL,
            unique: true
        },
        markdown: {
            allowNull: false,
            type: Sequelize.TEXT,
            defaultValue: Sequelize.NULL
        },
        content: {
            allowNull: false,
            type: Sequelize.TEXT,
            defaultValue: Sequelize.NULL
        },

        /**
         * The creation date of the event entry in the database
         * @var {DATE} createdAt
         */
        createdAt: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        },

        /**
         * The date of the last update of the event
         * @var {DATE} updatedAt
         */
        updatedAt: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    }),

    /**
     * Resets table 'events'.
     *
     * @function down
     * @param {Object} queryInterface - A query interface.
     * @returns {Promise} The promise to drop a table.
     */
    down: (queryInterface) => queryInterface.dropTable('events')
};
