'use strict';

module.exports = (sequelize, DataTypes) => {
    const Right = sequelize.define('Right', {
        groupWrite: {
            allowNull: false,
            default: false,
            type: DataTypes.BOOLEAN
        },
        groupRead: {
            allowNull: false,
            default: false,
            type: DataTypes.BOOLEAN
        },
        ownerWrite: {
            allowNull: false,
            default: false,
            type: DataTypes.BOOLEAN
        },
        ownerRead: {
            allowNull: false,
            default: false,
            type: DataTypes.BOOLEAN
        },
        allWrite: {
            allowNull: false,
            default: false,
            type: DataTypes.BOOLEAN
        },
        allRead: {
            allowNull: false,
            default: false,
            type: DataTypes.BOOLEAN
        }
    });
    return Right;
};