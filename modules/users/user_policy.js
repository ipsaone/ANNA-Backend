'use strict';

/**
 * @file
 * @see {@link module:user}
 */

/**
 * @module user
 */

const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');

const db = require(path.join(root, './modules'));

/**
 * Gets all users.
 *
 * @function filterIndex
 *
 * @param {Object} users - The users.
 * Ça fonctionera pas si c'est moi qui code mais NP gogogo mdr #cestAmberequifaitANNA.
 * @param {INTEGER} userId - The id of the user.
 *
 * @returns {Promise} Users.
 */
exports.filterIndex = (users, userId) => Promise.resolve(users)
    .then((us) => us.map((u) => {
        let user = {};

        if (u instanceof db.User) {
            user = u.toJSON();
        } else {
            // Else, assume it's already JSON !
            user = u;
        }

        delete user.password;
        if (user.id !== userId) {
            delete user.email;
        }

        return user;
    }));

/**
 * Gets one user.
 *
 * @function filterShow
 *
 * @param {Object} us - The us object from filterIndex function.
 * @param {INTEGER} userId - The id of the user.
 *
 * @returns {Promise} Returns a user.
 */
exports.filterShow = (us, userId) => Promise.resolve(us)
    .then((u) => {
        let user = {};

        if (u instanceof db.User) {
            user = u.toJSON();
        } else {
            // Else, assume it's already JSON !
            user = u;
        }

        delete user.password;
        if (user.id !== userId) {
            delete user.email;
        }

        return user;
    });

/**
 * Filters users who can create users.
 *
 * @function filterStore
 *
 * @param {Object} user - A user.
 *
 * @returns {Object} Returns all users.
 */
exports.filterStore = (user) => Promise.resolve(user);

/**
 * Filters users who can delete users.
 *
 * @function filterDelete
 *
 * @param {Object} user - A user.
 *
 * @returns {Object} Returns all users.
 */
exports.filterDelete = (user) => Promise.resolve(user);

/**
 * Filters users who can create groups.
 *
 * @function filterAddGroups
 *
 * @param {Array} groupsId - The id of all groups.
 * @param {INTEGER} userId - The id of the user.
 *
 * @returns {Promise} An array containing groups to which the user belongs.
 */
exports.filterAddGroups = async (groupsId, userId) => {
    const user = await db.User.findById(userId);

    if (user && await user.isRoot()) {
        return groupsId;
    }

    const groups = await user.getGroups();


    return groups.map((group) => group.id).filter((group) => groups.includes(group));

};

/**
 * Filters users who can delete a user from a group.
 *
 * @function filterDeleteGroups
 *
 * @param {Array} groupsId - The id of all groups.
 * @param {INTEGER} targetId - The id of the user that the user wants to delete from a group.
 * @param {INTEGER} userId - The id of the user.
 *
 * @returns {Promise} A user can delete himself from a group but only root can delete other users from groups.
 */
exports.filterDeleteGroups = async (groupsId, targetId, userId) => {
    if (targetId === userId) {
        return groupsId;
    }
    const user = await db.User.findById(userId);

    if (user && await user.isRoot()) {
        return groupsId;
    }


    throw new Error('Unauthorized');


};
