'use strict';


const Storage = require('../repositories/Storage');

module.exports = (sequelize, DataTypes) => {
    const File = sequelize.define('File', {
        isDir: {allowNull: false, type: DataTypes.BOOLEAN}
    }, {
        timestamps: false,
        
        instanceMethods: {
            getPath: Storage.getFilePath,
            getData: Storage.getFileData,
            getDirTree: Storage.getFileDirTree,
            getUrl: Storage.getFileeUrl,
            _computeSize: Storage._computeFileSize,
            _computeType: Storage._computeFileType
        }
    });

    return File;
};