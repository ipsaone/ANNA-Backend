'use strict';

/**
 * For removing the timestamps (createdAt and updatedAt) we need to create a model for our join table.
 * We add the option freezeTableName otherwise Sequelize will look for the UserGroups table or it's UserGroup.
 * @file
 * @see {@link module:userGroup}
 */

/**
 * @module userGroup
 */

/**
 * Defines a mapping between model and table 'UserGroup'.
 *
 * @function exports
 * @param {Object} sequelize - The Sequelize object.
 * @returns {Promise} The promise to define a mapping.
 */
module.exports = (sequelize) => sequelize.define('UserGroup', {}, {
    freezeTableName: true,
    timestamps: false,
    tableName: 'UserGroup'
});
