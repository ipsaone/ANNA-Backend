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
     */
    up: (queryInterface, Sequelize) => queryInterface.createTable('Files', {

        /**
         * The id of the file
         * @var id
         */
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        /**
         * ?
         * @var isDir
         */
        isDir: {
            allowNull: false,
            type: Sequelize.BOOLEAN
        }
    }),

    /**
     * Resets table 'Files'.
     *
     * @function down
     * @param {Object} queryInterface - A query interface.
     */
    down: (queryInterface) => queryInterface.dropTable('Files')
};
