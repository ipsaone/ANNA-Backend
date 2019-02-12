'use strict';

/**
 * For removing the timestamps (createdAt and updatedAt) we need to create a model for our join table.
 * We add the option freezeTableName otherwise Sequelize will look for the UserGroups table or it's UserGroup.
 * @file
 * @see {@link module:userGroup}
 */

/**
 * @module userMission
 */

/**
 * Defines a mapping between model and table 'UserMission'.
 *
 * @function exports
 * @param {Object} sequelize - The Sequelize object.
 * @returns {Promise} The promise to define a mapping.
 */
module.exports = (sequelize) => sequelize.define('UserMission', {}, {
    freezeTableName: true,
    timestamps: false,
    tableName: 'UserMission'
});
