'use strict';

module.exports = (sequelize, DataTypes) => {
    const File = sequelize.define('File', {
        isDir: {allowNull: false, type: DataTypes.BOOLEAN}
    }, {
        timestamps: false
    });

    return File;
};