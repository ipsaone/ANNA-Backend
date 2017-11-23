'use strict';

module.exports = (sequelize, DataTypes) => {
    const Right = sequelize.define('Right', {
        groupWrite: {
            allowNull: false,
            defaultValue: false,
            type: DataTypes.BOOLEAN
        },
        groupRead: {
            allowNull: false,
            defaultValue: false,
            type: DataTypes.BOOLEAN
        },
        ownerWrite: {
            allowNull: false,
            defaultValue: false,
            type: DataTypes.BOOLEAN
        },
        ownerRead: {
            allowNull: false,
            defaultValue: false,
            type: DataTypes.BOOLEAN
        },
        allWrite: {
            allowNull: false,
            defaultValue: false,
            type: DataTypes.BOOLEAN
        },
        allRead: {
            allowNull: false,
            defaultValue: false,
            type: DataTypes.BOOLEAN
        }
    }, {
        timestamps: false
    });
    return Right;
};
