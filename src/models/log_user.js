'use strict';

module.exports = (sequelize) => sequelize.define('LogUser', {}, {
    freezeTableName: true,
    timestamps: false,
    tableName: 'LogUser'
});
