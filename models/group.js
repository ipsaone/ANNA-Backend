'use strict';

/**
 * @file Defines a model for 'Group' table and creates its associations with other tables
 * @see {@link module:group}
 */

/**
 * @module group
 */

/**
 * Defines a mapping between model and table 'Group'.
 *
 * @function exports
 *
 * @param {Object} sequelize - The Sequelize object.
 * @param {Object} DataTypes - DataTypes.
 *
 * @returns {Object} Returns Group.
 */
module.exports = (sequelize, DataTypes) => {
    const Group = sequelize.define('Group', {
        name: {
            allowNull: false,
            type: DataTypes.STRING
        }
    }, {timestamps: false});

    /**
     * Associates Group to other tables.
     *
     * @function associate
     * @param {Object} models - This var regroups models of all tables.
     * @returns {Promise} The promise to create associations.
     */
    Group.associate = function (models) {

        /**
         * Creates plural associations with table 'User'
         * @function belongsToManyUser
         */
        Group.belongsToMany(models.User, {
            foreignKey: 'groupId',
            as: 'users',
            through: models.UserGroup,
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        /**
         * Creates plural associations with table 'Data'
         * @function hasManyData
         */
        Group.hasMany(models.Data, {
            as: 'files',
            foreignKey: 'groupId',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        /**
         * Creates plural associations with table 'Mission'
         * @function hasManyMission
         */
        Group.hasMany(models.Mission, {
            as: 'missions',
            foreignKey: 'groupId',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });
    };

    return Group;
};
