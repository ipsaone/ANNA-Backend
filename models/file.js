'use strict';


const Storage = require('../repositories/Storage');

module.exports = (sequelize, DataTypes) => {
    const File = sequelize.define('File', {
        isDir: {allowNull: false, type: DataTypes.BOOLEAN}
    }, {
        timestamps: false,

        classMethods: {
            
        },
        
        instanceMethods: {
            getPath: Storage.getInstancePath,
            getData: Storage.getInstanceData,
            getDirTree: Storage.getInstanceDirTree,
            getUrl: Storage.getInstanceUrl,
            _computeSize: Storage._computeInstanceSize,
            _computeType: Storage._computeInstanceType
        }
    });

    return File;
};