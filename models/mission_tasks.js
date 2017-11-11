'use strict';

/*
 * For removing the timestamps (createdAt and updatedAt) we need to create a model for our join table.
 * We add the option freezeTableName otherwise Sequelize will look for the UserGroups table or it's UserGroup.
 */

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('MissionTasks', {}, {timestamps: false, freezeTableName: true});
};