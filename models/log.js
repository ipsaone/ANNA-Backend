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
            allowNull: false,
            type: DataTypes.INTEGER
        }
    });

    Log.associate = function (models) {
        Log.belongsTo(models.User, {foreignKey: 'authorId', as: 'author'});
        Log.belongsToMany(models.File, {as: 'files', through: models.FileLog, foreignKey: 'logId'});
        Log.belongsToMany(models.User, {as: 'helpers', through: models.LogUser, foreignKey: 'logId'});
    };
    return Log;
};