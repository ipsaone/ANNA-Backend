'use strict';

/**
 * @file
 * @see {@link module:event}
 */

/**
 * @module event
 */

const db = require('../models');

/**
 * Get all events.
 *
 * @function filterIndex
 * @returns {Object} Returns all events.
 */
exports.filterIndex = () => Promise.resolve(true);

/**
 * Get a singular event.
 *
 * @function filterShow
 * @returns {Object} Returns one event.
 */
exports.filterShow = () => Promise.resolve(true);

/**
 * Filters users to keep only root.
 * Only root is allowed to create an event.
 *
 * @function filterStore
 *
 * @param {INTEGER} userId - The id of ther user verified by the function.
 *
 * @returns {boolean} Root user or error : 'Unauthorized'.
 *
 * @async
 */
exports.filterStore = async (userId) => {
    const user = await db.User.findById(userId);

    if (user && await user.isRoot()) {
        return true;
    }

    throw new Error('Unauthorized');
};

/**
 * Filters users to keep only root.
 * Only root is allowed to update an event.
 *
 * @function filterUpdate
 *
 * @param {INTEGER} userId The id of ther user verified by the function.
 *
 * @returns {boolean} root user or error : 'Unauthorized'
 *
 * @async
 */
exports.filterUpdate = async (userId) => {
    const user = await db.User.findById(userId);

    if (user && await user.isRoot()) {
        return true;
    }

    throw new Error('Unauthorized');
};

/**
 * Filters users to keep only root.
 * Only root is allowed to delete an event.
 *
 * @function filterDelete
 *
 * @param {INTEGER} userId The id of ther user verified by the function.
 *
 * @returns {boolean} root user or error : 'Unauthorized'
 *
 * @async
 */
exports.filterDelete = async (userId) => {
    const user = await db.User.findById(userId);

    if (user && await user.isRoot()) {
        return true;
    }

    throw new Error('Unauthorized');
};
