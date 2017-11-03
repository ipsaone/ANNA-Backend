'use strict';


module.exports = (sequelize, DataTypes) => {
    const File = sequelize.define('File', {
        isDir: {allowNull: false, type: DataTypes.BOOLEAN}
    }, {
        timestamps: false
    });

    const Storage = require('../repositories/Storage');

    File.prototype.getData = Storage.getFileData;
    File.prototype.getDirTree = Storage.getFileDirTre;
    File.prototype.addData = Storage.addFileData;

    File.createNew = Storage.createNewFile;

    return File;
};


