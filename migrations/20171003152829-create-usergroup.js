'use strict';

/**
 * Creates table 'UserGroup'
 * @module createUsergroup
 * @implements {up}
 * @implements {down}
 */

module.exports = {

    /**
     * Sets the table 'UserGroup'.
     *
     * @function up
     * @implements {id}
     * @implements {userId}
     * @implements {groupId}
     * @param {Object} queryInterface - A query interface.
     * @param {Object} Sequelize - The Sequelize object.
     * @returns {Promise} The promise to drop a table.
     */
    up: (queryInterface, Sequelize) => queryInterface.createTable('UserGroup', {

        /**
         * The id of the UserGroup
         * @var id
         */
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        /**
         * The userId of the user who belongs to a group
         * @var userId
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
         * The groupId to which the user belongs
         * @var groupId
         */
        groupId: {
            allowNull: false,
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            references: {
                model: 'Groups',
                key: 'id'
            }
        }
    }),

    /**
     * Resets the table 'UserGroup'.
     *
     * @function down
     * @param {Object} queryInterface - A query interface.
     * @returns {Promise} The promise to drop a table.
     */
    down: (queryInterface) => queryInterface.dropTable('UserGroup')
};
