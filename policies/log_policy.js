'use strict';

/**
 * @file
 * @see {@link module:log}
 */

/**
 * @module log
 */

const db = require('../models');
const userPolicy = require('./user_policy');
const allowed = [
    'title',
    'markdown'
];

/**
 * Get all logs, their author and dates.
 *
 * @function filterIndex
 *
 * @param {Array} l - The creation date of each log.
 * @param {INTEGER} userId - The id of the user.
 *
 * @returns {Object} Returns all logs.
 */
exports.filterIndex = (l, userId) => {

    /**
     * JSON dates
     * @const logs
     */
    const logs = l.map((log) => log.toJSON());

    const p = logs.map((log, index) => userPolicy
        .filterShow(log.author, userId)
        .then((user) => {
            logs[index].author = user;

            return true;
        }));


    return Promise.all(p).then(() => logs);
};

/**
 * Get a singular log, its author and its date.
 *
 * @function filterShow
 *
 * @param {Date} l - The creation date of the log.
 * @param {INTEGER} userId - The id of a user.
 *
 * @returns {Object} Returns one log.
 */
exports.filterShow = async (l, userId) => {
    const log = l.toJSON();

    log.author = await userPolicy.filterShow(log.author, userId);

    return Promise.resolve(log);
};

/**
 * Filters users who can create a log.
 *
 * @function filterStore
 *
 * @param {Object} builder - The builder object.
 * @param {INTEGER} userId - The id of a user.
 *
 * @returns {Object} Returns users who can create logs.
 */
exports.filterStore = (builder, userId) => {
    const keys = Object.keys(builder);

    keys.forEach((key) => {
        if (!allowed.includes(key)) {
            delete builder[key];
        }
    });

    builder.authorId = userId;

    return Promise.resolve(builder);
};

/**
 * Filters users who can update logs.
 *
 * @function filterUpdate
 * @async
 *
 * @param {Object} builder - The builder object.
 * @param {INTEGER} logId - The id of the log.
 * @param {INTEGER} userId - The id of a user.
 *
 * @returns {boolean} Only root and the author of the log can update a log.
 */
exports.filterUpdate = async (builder, logId, userId) => {

    const keys = Object.keys(builder);

    keys.forEach((key) => {
        if (!allowed.contains(key)) {
            delete builder[key];
        }
    });

    const user = await db.User.findById(userId);

    if (user && await user.isRoot()) {
        return builder;
    }

    const log = await db.Log.findById(logId);

    if (log.authorId === userId) {
        return builder;
    }

    return false;
};

/**
 * Filters users who can delete logs.
 * Only root can delete one.
 *
 * @function filterDelete
 * @async
 *
 * @param {INTEGER} userId - The id of the user who want to delete a log.
 *
 * @returns {boolean} Either the user can delete the log or the function throws an error 'Unauthorized'.
 */
exports.filterDelete = async (userId) => {

    const user = await db.User.findById(userId);

    // Only root users can delete logs
    if (user && await user.isRoot()) {
        return true;
    }

    return false;

};
