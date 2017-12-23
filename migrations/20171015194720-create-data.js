'use strict';

/**
 * @file Manages the table containing 'data'
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
     * @returns {Promise} The promise to drop a table.
     *
     */
    up: (queryInterface, Sequelize) => queryInterface.createTable('Data', {

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
         * The name of the data
         * @var name
         */
        name: {
            allowNull: false,
            type: Sequelize.STRING
        },

        /**
         * The type of the data
         * @var type
         */
        type: {
            allowNull: true,
            type: Sequelize.STRING
        },

        /**
         * The size of the data
         * @var size
         */
        size: {
            allowNull: true,
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
            onUpdate: 'CASCADE',
            references: {
                model: 'Files',
                key: 'id'
            }
        },

        /**
         * The id of the directory ?
         * @var dirId
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
         * The id of the rights on the file ?
         * @var rightsId
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
         * @var ownerId
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
         * @var groupId
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
         * @var createdAt
         */
        createdAt: {
            allowNull: false,
            type: Sequelize.DATE
        },

        /**
         * The date of the last update of the file
         * @var updatedAt
         */
        updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
        }
    }),

    /**
     * @function down
     * @param {Object} queryInterface - A query interface.
     */
    down: (queryInterface) => queryInterface.dropTable('Data')
};
