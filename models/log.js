'use strict';

const marked = require('marked');

module.exports = (sequelize, DataTypes) => {
    const Log = sequelize.define('Log', {
        title: {
            allowNull: false,
            type: DataTypes.STRING
        },
        markdown: {
            allowNull: false,
            type: DataTypes.TEXT,
            set (val) {
                this.setDataValue('markdown', val); // Set this field with the raw markdown
                this.setDataValue('content', marked(val));
            }
        },
        content: {
            allowNull: false,
            type: DataTypes.TEXT
        },
        authorId: {
            allowNull: true,
            type: DataTypes.INTEGER
        }
    }, {});

    Log.associate = function (models) {
        Log.belongsTo(models.User, {
            foreignKey: 'authorId',
            as: 'author',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        });
        Log.belongsToMany(models.File, {
            as: 'files',
            through: models.FileLog,
            foreignKey: 'logId'
        });
        Log.belongsToMany(models.User, {
            as: 'helpers',
            through: models.LogUser,
            foreignKey: 'logId'
        });
    };

    return Log;
};
