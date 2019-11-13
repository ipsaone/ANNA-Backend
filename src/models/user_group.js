'use strict';

module.exports = (sequelize) => sequelize.define('UserGroup', {}, {
    freezeTableName: true,
    timestamps: false,
    tableName: 'UserGroup'
});
