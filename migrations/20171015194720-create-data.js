'use strict';

/**
 * @file Manages the table used to update files in the database
 * @see {@link module:createData}
 */

/**
 * Creates table 'Data'
 * @module createData
 * @implements {up}
 * @implements {down}
 */

module.exports = {

    /**
     * Sets table 'Data'.
     *
     * @function up
     *
     * @param {Object} queryInterface - A query interface.
     * @param {Object} Sequelize - The Sequelize object.
     *
     * @implements {id}
     * @implements {name}
     * @implements {type}
     * @implements {size}
     * @implements {fileId}
     * @implements {dirId}
     * @implements {rightsId}
     * @implements {ownerId}
     * @implements {groupId}
     * @implements {createdAt}
     * @implements {updatedAt}
     *
     * @returns {Promise} The promise to create a table.
     *
     */
    up: (queryInterface, Sequelize) => queryInterface.createTable('Data', {

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
         * The name of the update
         * @var {STRING} name
         */
        name: {
            allowNull: false,
            type: Sequelize.STRING
        },

        /**
         * The type of the file
         * @var {STRING} type
         */
        type: {
            allowNull: true,
            type: Sequelize.STRING
        },

        /**
         * The size of the update
         * @var {INTEGER} size
         */
        size: {
            allowNull: true,
            type: Sequelize.INTEGER
        },

        /**
         * The id of the file
         * @var {INTEGER} fileId
         */
        fileId: {
            allowNull: false,
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            references: {
                model: 'Files',
                key: 'id'
            }
        },

        /**
         * The id of the directory ?
         * @var {INTEGER} dirId
         */
        dirId: {
            allowNull: false,
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            OnUpdate: 'CASCADE',
            references: {
                model: 'Files',
                key: 'id'
            }
        },

        /**
         * The id of the rights on the file
         * @var {INTEGER} rightsId
         */
        rightsId: {
            allowNull: true,
            type: Sequelize.INTEGER,
            onDelete: 'SET NULL',
            onUpdate: 'SET NULL',
            references: {
                model: 'Rights',
                key: 'id'
            }
        },

        /**
         * The id of the owner
         * @var {INTEGER} ownerId
         */
        ownerId: {
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
         * The id of the group
         * @var {INTEGER} groupId
         */
        groupId: {
            allowNull: true,
            type: Sequelize.INTEGER,
            onDelete: 'SET NULL',
            onUpdate: 'SET NULL',
            references: {
                model: 'Groups',
                key: 'id'
            }
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
        deletedAt: {
            allowNull: true,
            type: Sequelize.DATE
        }
    }),

    /**
     * @function down
     * @param {Object} queryInterface - A query interface.
     * @returns {Promise} The promise to drop a table.
     */
    down: (queryInterface) => queryInterface.dropTable('Data')
};
