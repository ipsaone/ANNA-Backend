'use strict';

/**
 * @file Defines a model for 'Task' table and creates its associations with the other tables
 * @see {@link module:task}
 */

/**
 * @module task
 */

/**
 * @function exports
 *
 * @param {Object} sequelize - The Sequelize object.
 * @param {Object} DataTypes - DataTypes.
 *
 * @returns {Object} Returns Task.
 *
 */
module.exports = (sequelize, DataTypes) => {

    /**
     * Defines a mapping between model and table 'Task'
     * @function Task
     *
     * @param {Obect} Task The table defined by the function
     *
     * @implements {name}
     * @implements {done}
     * @implements {missionId}
     *
     * @returns {Object} Task
     */
    const Task = sequelize.define('Task', {

        /**
         * The name of the task
         * @var {STRING} name
         */
        name: {
            allowNull: false,
            type: DataTypes.STRING
        },

        /**
         * Indicates if the task was completed or not
         * @var {BOOLEAN} done
         */
        done: {
            allowNull: false,
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },

        /**
         * The id of the mission to which the task is part of
         * @var {INTEGER} missionId
         */
        missionId: {
            allowNull: false,
            type: DataTypes.INTEGER
        }
    }, {timestamps: false});

    /**
     * Associates Task to other tables.
     *
     * @function associate
     * @param {Object} models - This var regroups models of all tables.
     * @returns {Promise} The promise to create associations.
     */
    Task.associate = function (models) {

        /**
         * Creates singular association between tables 'Task' and 'Mission'
         * @function belongsToMission
         */
        Task.belongsTo(models.Mission, {
            foreignKey: 'missionId',
            as: 'mission',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
    };

    return Task;
};
