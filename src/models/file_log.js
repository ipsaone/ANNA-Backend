'use strict';

module.exports = (sequelize) => sequelize.define('FileLog', {}, {
    freezeTableName: true,
    tableName: 'FileLog',
    timestamps: false
});
