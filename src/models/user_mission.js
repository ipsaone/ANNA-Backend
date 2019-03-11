'use strict';

module.exports = (sequelize) => sequelize.define('UserMission', {}, {
    freezeTableName: true,
    timestamps: false,
    tableName: 'UserMission'
});
