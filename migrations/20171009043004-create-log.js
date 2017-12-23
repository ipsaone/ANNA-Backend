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
     */
    up: (queryInterface, Sequelize) => queryInterface.createTable('Logs', {

        /**
         * The id of the log
         * @var id
         */
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        /**
         * The title of the log
         * @var title
         */
        title: {
            allowNull: false,
            type: Sequelize.STRING
        },

        /**
         * The content sent by the author
         * @var markdown
         */
        markdown: {
            allowNull: false,
            type: Sequelize.TEXT
        },

        /**
         * The content seen by the user
         * @var content
         */
        content: {
            allowNull: false,
            type: Sequelize.TEXT
        },

        /**
         * The Id of the author of the log
         * @var authorId
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
         * @var createdAt
         */
        createdAt: {
            allowNull: false,
            type: Sequelize.DATE
        },

        /**
         * The date of the last update of the log
         * @var updatedAt
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
     */
    down: (queryInterface) => queryInterface.dropTable('Logs')
};
