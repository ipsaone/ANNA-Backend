'use strict';


module.exports = (sequelize, DataTypes) => {
    const File = sequelize.define('File', {
        isDir: {allowNull: false, type: DataTypes.BOOLEAN}
    }, {
        timestamps: false
    });

    const Storage = require('../repositories/Storage');
    File.associate = function (models) {
        File.belongsTo(models.User, {foreignKey: 'ownerId', as: 'owner'});
        File.belongsTo(models.Group, {foreignKey: 'groupId', as: 'group'});
        //File.belongsToMany(models.Log, {as: 'logs', through: models.FileLog, foreignKey: 'userId'})
    };

    File.prototype.getData = Storage.getFileData;
    File.prototype.getDirTree = Storage.getFileDirTre;
    File.prototype.addData = Storage.addFileData;

    File.createNew = Storage.createNewFile;

    return File;
};
