'use strict';

/**
 * @file Manages the table containing all missions and their description, budget, and assigned
 * @see {@link module:createMissions}
 */

/**
 * Creates table 'Missions'
 * @module createMissions
 * @implements {up}
 * @implements {down}
 */

module.exports = {

    /**
     * Sets table 'Missions'.
     *
     * @function up
     * @param {Object} queryInterface - A query interface.
     * @param {Object} Sequelize - The Sequelize object.
     *
     * @implements {id}
     * @implements {name}
     * @implements {markdown}
     * @implements {description}
     * @implements {budgetAssigned}
     * @implements {budgetUsed}
     * @implements {groupId}
     * @implements {leaderId}
     *
     * @returns {Promise} The promise to create a table.
     *
     */
    up: (queryInterface, Sequelize) => queryInterface.createTable('Missions', {

        /**
         * The id of the mission
         * @var {INTEGER} id
         */
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        /**
         * The name of the mission
         * @var {STRING} name
         */
        name: {
            allowNull: false,
            type: Sequelize.STRING,
            unique: true
        },

        /**
         * The content sent by the author
         * @var {TEXT} markdown
         */
        markdown: {
            allowNull: true,
            type: Sequelize.STRING
        },

        /**
         * The description of the mission
         * @var {STRING} description
         */
        description: {
            allowNull: true,
            type: Sequelize.STRING
        },

        /**
         * The budget assigned to the mission
         * @var {INTEGER} budgetAssigned
         */
        budgetAssigned: {
            allowNull: true,
            type: Sequelize.INTEGER
        },

        /**
         * The budget already used for the mission
         * @var {INTEGER} budgetUsed
         */
        budgetUsed: {
            allowNull: true,
            type: Sequelize.INTEGER
        },

        /**
         * The id of the group assigned to the mission
         * @var {INTEGER} groupId
         */
        groupId: {
            allowNull: false,
            type: Sequelize.INTEGER,
            references: {
                model: 'Groups',
                key: 'id',
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE'
            }
        },

        /**
         * The id of the leader of the mission
         * @var {INTEGER} leaderId
         */
        leaderId: {
            allowNull: false,
            type: Sequelize.INTEGER,
            references: {
                model: 'Users',
                key: 'id',
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE'
            }
        },
        createdAt: {
            allowNull: false,
            type: Sequelize.DATE
        },
        updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
        }
    }),

    /**
     * Resets table 'Missions'.
     *
     * @function down
     * @param {Object} queryInterface - A query interface.
     * @returns {Promise} The promise to drop a table.
     */
    down: (queryInterface) => {
        queryInterface.dropTable('Missions');
    }
};
