'use strict';

module.exports = (sequelize, DataTypes) => {
    const Log = sequelize.define('Log', {
        title: {
            allowNull: false,
            type: DataTypes.STRING
        },
        content: {
            allowNull: false,
            type: DataTypes.TEXT
        },
        authorId: {
            allowNull: true,
            type: DataTypes.INTEGER
        }
    }, {
        tableName: 'Log'
    });

    Log.associate = function (models) {
        Log.belongsTo(models.User, {foreignKey: 'authorId', as: 'author', onDelete: 'SET NULL', onUpdate: 'CASCADE'});
        Log.belongsToMany(models.File, {as: 'files', through: models.FileLog, foreignKey: 'logId'});
        Log.belongsToMany(models.User, {as: 'helpers', through: models.LogUser, foreignKey: 'logId'});
    };
    return Log;
};
