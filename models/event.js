'use strict';

const marked = require('marked');

module.exports = (sequelize, DataTypes) => {
    const event = sequelize.define('Event', {
        name: {
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
        }

    });

    return event;
};
