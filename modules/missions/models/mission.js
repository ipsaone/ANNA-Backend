'use strict';

/**
 * Defines a model for 'Log' table in database and its associations with the other tables
 * @file
 * @see {@link module:mission}
 */

/**
 * @module mission
 */

const compileMd = () => '';
const marked = require('marked');

/**
 * @function exports
 *
 * @param {Object} sequelize - The Sequelize object.
 * @param {Object} DataTypes - DataTypes.
 *
 * @returns {Object} Returns Mission.
 *
 */
module.exports = (sequelize, DataTypes) => {

    /**
     * Defines a mapping between model and table 'Mission'
     * @function Mission
     *
     * @param {Obect} Mission The table defined by the function
     *
     * @implements {name}
     * @implements {markdown}
     * @implements {description}
     * @implements {budgetAssigned}
     * @implements {budgetUsed}
     * @implements {groupId}
     * @implements {leaderId}
     * @implements {timestamps}
     * @implements {hooks}
     *
     * @returns {Object} Mission
     */
    const Mission = sequelize.define('Mission', {

        /**
         * The name of the mission
         * @var {STRING} name
         */
        name: {
            allowNull: false,
            type: DataTypes.STRING
        },

        /**
         * The description sent by the author
         * @var {STRING} markdown
         */
        markdown: {
            allowNull: true,
            type: DataTypes.STRING,
            set (val) {
                this.setDataValue('markdown', val); // Set this field with the raw markdown
                this.setDataValue('description', marked(val));
            }
        },

        /**
         * The description seen by the user
         * @var {STRING} description
         */
        description: {
            allowNull: true,
            type: DataTypes.STRING
        },

        /**
         * The budget assigned to the mission
         * @var {INTEGER} budgetAssigned
         */
        budgetAssigned: {
            allowNull: true,
            type: DataTypes.INTEGER
        },

        /**
         * The budget already used for the mission
         * @var {INTEGER} budgetUsed
         */
        budgetUsed: {
            allowNull: true,
            type: DataTypes.INTEGER
        },

        /**
         * The id of the group working on the mission
         * @var {INTEGER} groupId
         */
        groupId: {
            allowNull: false,
            type: DataTypes.INTEGER
        },

        /**
         * The id of the leader of the mission
         * @var {INTEGER} leaderId
         */
        leaderId: {
            allowNull: false,
            type: DataTypes.INTEGER
        }
    }, {
        timestamps: true,
        hooks: {
            beforeCreate: compileMd,
            beforeUpdate: compileMd
        }
    });

    /**
     * Associates Mission to other tables.
     *
     * @function associate
     * @param {Object} models - This var regroups models of all tables.
     * @returns {Promise} The promise to create associations.
     */
    Mission.associate = function (models) {

        /**
         * Creates singular association between tables 'Mission' and 'Group'
         * @function belongsToGroup
         */
        Mission.belongsTo(models.Group, {
            foreignKey: 'groupId',
            as: 'group',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        /**
         * Createes singular association between tables 'Mission' and 'User'
         * @function belongsToUser
         */
        Mission.belongsTo(models.User, {
            foreignKey: 'leaderId',
            as: 'leader',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });
        Mission.hasMany(models.Task, {
            as: 'tasks',
            foreignKey: 'missionId',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });
        Mission.belongsToMany(models.User, {
            as: 'members',
            foreignKey: 'missionId',
            through: models.UserMission,
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });
    };

    return Mission;
};
