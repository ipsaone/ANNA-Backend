'use strict';

/**
 * @file Manages the table containing all files
 * @see {@link module:createFile}
 */

/**
 * Creates table 'Users'
 * @module createFile
 * @implements {up}
 * @implements {down}
 */

module.exports = {

    /**
     * Sets table 'Files'.
     *
     * @function up
     *
     * @param {Object} queryInterface - A query interface.
     * @param {Object} Sequelize - The Sequelize object.
     *
     * @implements {id}
     * @implements {isDir}
     *
     * @returns {Promise} The promise to create a table.
     *
     */
    up: (queryInterface, Sequelize) => queryInterface.createTable('Files', {

        /**
         * The id of the file
         * @var {INTEGER} id
         */
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        /**
         * Is it a directory ?
         * @var {BOOLEAN} isDir
         */
        isDir: {
            allowNull: false,
            type: Sequelize.BOOLEAN
        },
        /**
         * The creation date of the file
         * @var {DATE} createdAt
         */
        createdAt: {
            allowNull: false,
            type: Sequelize.DATE
        },
        /**
         * The date of the last update of the file
         * @var {DATE} updatedAt
         */
        updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
        },
        /**
         * The date of deletion of the file
         * @var {DATE} deletedAt
         */
        deletedAt: {
            allowNull: true,
            type: Sequelize.DATE
        }
    }),

    /**
     * Resets table 'Files'.
     *
     * @function down
     * @param {Object} queryInterface - A query interface.
     * @returns {Promise} The promise to drop a table.
     */
    down: (queryInterface) => queryInterface.dropTable('Files')
};
