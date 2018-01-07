'use strict';

/**
 * @file
 * @see {@link module:mission}
 */

/**
 * @module mission
 */

const db = require('../models');

/**
 * Gets all missions.
 *
 * @function filterIndex
 * @returns {Object} Returns all missions.
 */
exports.filterIndex = () => Promise.resolve(true);

/**
 * Gets one mission.
 *
 * @function filterShow
 * @returns {Object} Returns one mission.
 */
exports.filterShow = () => Promise.resolve(true);

/**
 * Filters users who can create a mission.
 * Only root can create a mission.
 *
 * @function filterStore
 * @async
 *
 * @param {INTEGER} userId - The id of the user.
 *
 * @returns {boolean} Either the user is root or the function throws an error 'Unauthorized'.
 */
exports.filterStore = async (userId) => {
    const user = await db.User.findById(userId);

    if (user && await user.isRoot()) {
        return true;
    }

    throw new Error('Unauthorized');
};

/**
 * Filters the users who can update a mission.
 * Only root can update a mission.
 *
 * @function filterUpdate
 * @async
 *
 * @param {INTEGER} userId - The id of the user.
 *
 * @returns {boolean} Either the user is root or the function throws an error 'Unauthorized'.
 */
exports.filterUpdate = async (userId) => {
    const user = await db.User.findById(userId);

    if (user && await user.isRoot()) {
        return true;
    }

    throw new Error('Unauthorized');
};

/**
 * Filters users who can delete a mission.
 * Only root can delete a mission.
 *
 * @function filterDelete
 * @async
 *
 * @param {INTEGER} userId - The id of the user trying to delete a mission.
 *
 * @returns {boolean} Either the user is root or the function throws an error 'Unauthorized'.
 */
exports.filterDelete = async (userId) => {
    const user = await db.User.findById(userId);

    if (user && await user.isRoot()) {
        return true;
    }

    throw new Error('Unauthorized');
};
