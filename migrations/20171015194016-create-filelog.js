'use strict';

/**
 * @file Manages the junction table between files and logs
 * @see {@link module:createFileLog}
 */

/**
 * Creates table 'FileLog'
 * @module createFileLog
 * @implements {up}
 * @implements {down}
 */

module.exports = {

    /**
     * Sets table 'FileLog'.
     *
     * @function up
     *
     * @param {Object} queryInterface - A query interface.
     * @param {Object} Sequelize - The Sequelize object.
     *
     * @implements {id}
     * @implements {fileId}
     * @implements {logId}
     *
     */
    up: (queryInterface, Sequelize) => queryInterface.createTable('FileLog', {

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
         * The id of the file
         * @var fileId
         */
        fileId: {
            allowNull: false,
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: 'Files',
                key: 'id'
            }
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
        }
    }),

    /**
     * Resets table 'FileLog'.
     *
     * @function down
     * @param {Object} queryInterface - A query interface.
     */
    down: (queryInterface) => queryInterface.dropTable('FileLog')
};
