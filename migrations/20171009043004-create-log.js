'use strict';

/**
 * @file Manages the table containing all logs in the database
 * @see {@link module:createLog}
 */

/**
 * Creates table 'Logs'
 * @module createLog
 * @implements {up}
 * @implements {down}
 */

module.exports = {

    /**
     * Sets table "Logs".
     *
     * @function up
     * @param {Object} queryInterface - A query interface.
     * @param {Object} Sequelize - The Sequelize object.
     * @implements {id}
     * @implements {title}
     * @implements {markdown}
     * @implements {content}
     * @implements {createdAt}
     * @implements {authorId}
     * @implements {updatedAt}
     *
     * @returns {Promise} The promise to create a table.
     *
     */
    up: (queryInterface, Sequelize) => queryInterface.createTable('Logs', {

        /**
         * The id of the log
         * @var {INTEGER} id
         */
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        /**
         * The title of the log
         * @var {STRING} title
         */
        title: {
            allowNull: false,
            type: Sequelize.STRING,
            unique: true
        },

        /**
         * The content sent by the author
         * @var {TEXT} markdown
         */
        markdown: {
            allowNull: false,
            type: Sequelize.TEXT
        },

        /**
         * The content seen by the user
         * @var {TEXT} content
         */
        content: {
            allowNull: false,
            type: Sequelize.TEXT
        },

        /**
         * The Id of the author of the log
         * @var {INTEGER} authorId
         */
        authorId: {
            allowNull: true,
            type: Sequelize.INTEGER,
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
            references: {
                model: 'Users',
                key: 'id'
            }
        },

        /**
         * The creation date of the log
         * @var {DATE} createdAt
         */
        createdAt: {
            allowNull: false,
            type: Sequelize.DATE
        },

        /**
         * The date of the last update of the log
         * @var {DATE} updatedAt
         */
        updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
        }
    }),

    /**
     * Resets table 'Logs'.
     *
     * @function down
     * @param {Object} queryInterface - A query interface.
     * @returns {Promise} The promise to drop a table.
     */
    down: (queryInterface) => queryInterface.dropTable('Logs')
};
