'use strict';

/**
 * @file
 * @see {@link module:mission}
 */

/**
 * @module mission
 */
const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');
const db = require(path.join(root, 'src', './modules'));

/**
 * Gets all missions.
 *
 * @function filterIndex
 * @returns {Object} Returns all missions.
 */
exports.filterIndex = (db) => Promise.resolve(true);

/**
 * Gets one mission.
 *
 * @function filterShow
 * @returns {Object} Returns one mission.
 */
exports.filterShow = (db) => Promise.resolve(true);

/**
 * Filters users who can create a mission.
 * Only root can create a mission.
 *
 * @function filterStore
 *
 * @param {INTEGER} userId - The id of the user.
 *
 * @returns {boolean} Either the user is root or the function throws an error 'Unauthorized'.
 */
exports.filterStore = async (db, userId) => {
    const user = await db.User.findByPk(userId);

    if (user && await user.isRoot()) {
        return true;
    }

    return false;
};

/**
 * Filters the users who can update a mission.
 * Only root can update a mission.
 *
 * @function filterUpdate
 *
 * @param {INTEGER} userId - The id of the user.
 *
 * @returns {boolean} Either the user is root or the function throws an error 'Unauthorized'.
 */
exports.filterUpdate = async (db, userId) => {
    const user = await db.User.findByPk(userId);

    if (user && await user.isRoot()) {
        return true;
    }

    return false;
};

/**
 * Filters users who can delete a mission.
 * Only root can delete a mission.
 *
 * @function filterDelete
 *
 * @param {INTEGER} userId - The id of the user trying to delete a mission.
 *
 * @returns {boolean} Either the user is root or the function throws an error 'Unauthorized'.
 */
exports.filterDelete = async (db, userId) => {
    const user = await db.User.findByPk(userId);

    if (user && await user.isRoot()) {
        return true;
    }

    return false;
};

exports.filterIndexTasks = () => true;
exports.filterShowTask = () => true;
exports.filterStoreTask = async (db, mission, userId) => {

    if (userId === mission.leaderId) {
        return true;
    }

    const user = await db.User.findByPk(userId);
    if (await user.isRoot()) {
        return true;
    }

    return false;
};
exports.filterUpdateTask = async (db, contents, mission, userId) => {

    if (userId === mission.leaderId) {
        return contents;
    }

    const user = await db.User.findByPk(userId);

    
    if (await user.isRoot()) {
        return contents;
    }

    return [];
};
exports.filterDeleteTask = async (db, mission, userId) => {

    if (userId === mission.leaderId) {
        return true;
    }

    const user = await db.User.findByPk(userId);

    if (await user.isRoot()) {
        return true;
    }

    return false;
};

exports.filterStoreMember = async (db, mission, userId) => {
    if (userId === mission.leaderId) {
        return true;
    }

    const user = await db.User.findByPk(userId);

    if (await user.isRoot()) {
        return true;
    }

    return false;
};
exports.filterDeleteMember = async (db, mission, userId) => {
    if (userId === mission.leaderId) {
        return true;
    }

    const user = await db.User.findByPk(userId);

    if (await user.isRoot()) {
        return true;
    }

    return false;
};