'use strict';

module.exports = (sequelize) => sequelize.define('EventUser', {}, {
    freezeTableName: true,
    timestamps: false,
    tableName: 'EventUser'
});
