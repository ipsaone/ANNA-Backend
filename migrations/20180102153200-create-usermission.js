'use strict';

/**
 * @file Manages the junction table between users and groups
 * @see {@link module:userMission}
 */

/**
 * Creates table 'UserMission'
 * @module userMission
 * @implements {up}
 * @implements {down}
 */

module.exports = {

    /**
     * Sets table 'UserMission'.
     *
     * @function up
     *
     * @param {Object} queryInterface - A query interface.
     * @param {Object} Sequelize - The Sequelize object.
     *
     * @implements {id}
     * @implements {userId}
     * @implements {missionId}
     *
     * @returns {Promise} The promise to create a table.
     *
     */
    up: (queryInterface, Sequelize) => queryInterface.createTable('UserMission', {

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
         * @var {INTEGER} missionId
         */
        missionId: {
            allowNull: false,
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            references: {
                model: 'Missions',
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
    down: (queryInterface) => queryInterface.dropTable('UserMission')
};
