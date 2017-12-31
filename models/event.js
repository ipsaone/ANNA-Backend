'use strict';

/**
 * @file Defines a model for 'events' table and creates its associations with the other tables
 * @see {@link module:event}
 */

/**
 * @module event
 */

const marked = require('marked');

/**
 * Defines a mapping between model and table 'Event'.
 *
 * @function exports
 *
 * @param {Object} sequelize - The Sequelize object.
 * @param {Object} DataTypes - DataTypes.
 *
 * @returns {Object} Returns event.
 *
 */
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
