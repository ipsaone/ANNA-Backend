'use strict';

/**
 * @file Defines a model for 'events' table and creates its associations with the other tables
 * @see {@link module:event}
 */

/**
 * @module event
 */

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
    const event = sequelize.define('Event', {name: DataTypes.STRING});

    return event;
};
