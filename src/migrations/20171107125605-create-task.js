'use strict';

/**
 * @file Manages the table containing all tasks in the database
 * @see {@link module:createTasks}
 */

/**
 * Creates table 'Tasks'
 * @module createTasks
 * @implements {up}
 * @implements {down}
 */

module.exports = {

    /**
     * Sets table 'Tasks'.
     *
     * @function up
     *
     * @param {Object} queryInterface - A query interface.
     * @param {Object} Sequelize - The Sequelize object.
     *
     * @implements {id}
     * @implements {name}
     * @implements {done}
     * @implements {missionId}
     *
     * @returns {Promise} The promise to create a table.
     *
     */
    up: (queryInterface, Sequelize) => queryInterface.createTable('Tasks', {

        /**
         * The id of the task
         * @var {INTEGER} id
         */
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        /**
         * The name of the task
         * @var {STRING} name
         */
        name: {
            allowNull: false,
            type: Sequelize.STRING
        },

        /**
         * Shows if the task is complete or not
         * @var {BOOLEAN} done
         */
        done: {
            allowNull: false,
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },

        /**
         * The id of the mission to which the task is part of
         * @var {INTEGER} missionId
         */
        missionId: {
            allowNull: false,
            type: Sequelize.INTEGER
        }
    }),

    /**
     * Resets table 'Tasks'.
     *
     * @param {Object} queryInterface - A query interface.
     * @returns {Promise} The promise to drop a table.
     */
    down: (queryInterface) => 
        queryInterface.dropTable('Tasks')
    
};
