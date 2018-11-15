'use strict';

/**
 * @file
 * @see {@link module:user}
 */

/**
 * @module user
 */

/**
 * Gets all users.
 *
 * @function filterIndex
 *
 * @param {obj} db - The database.
 * @param {Object} users - The users..
 * @param {INTEGER} userId - The id of the user.
 *
 * @returns {Promise} Users.
 */
exports.filterIndex = (db, users, userId) => Promise.resolve(users)
    .then((us) => us.map((thisUser) => {
        let user = {};

        if (thisUser instanceof db.User) {
            user = thisUser.toJSON();
        } else {
            // Else, assume it's already JSON !
            user = thisUser;
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
 * @param {obj} db - The database.
 * @param {Object} us - The us object from filterIndex function.
 * @param {INTEGER} userId - The id of the user.
 *
 * @returns {Promise} Returns a user.
 */
exports.filterShow = (db, us, userId) => Promise.resolve(us)
    .then((thisUser) => {
        let user = {};

        if (thisUser instanceof db.User) {
            user = thisUser.toJSON();
        } else if (thisUser) {
            // Else, assume it's already JSON !
            user = thisUser;
        } else {
            return {};
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
 * @param {obj} db - The database.
 * @param {Object} user - A user.
 *
 * @returns {Object} Returns all users.
 */
exports.filterStore = (db, user) => async (db, userId) => {
    let user = db.User.findByPk(userId);
    let isRoot = await user.isRoot();
    if (!isRoot) {
        return false;
    }
    
    return true;
};

/**
 * Filters users who can edit users.
 *
 * @function filterUpdate
 *
 * @param {obj} db - The database.
 * @param {Object} user - A user.
 *
 * @returns {Object} Returns all users.
 */
exports.filterUpdate = (db, targetId, userId) => async (db, targetId, userId) => {
    let user = db.User.findByPk(userId);
    let isRoot = await user.isRoot();
    if (!isRoot) {
        return false;
    }
    
    return true;
};;

/**
 * Filters users who can delete users.
 *
 * @function filterDelete
 *
 * @param {obj} db - The database.
 * @param {Object} user - A user.
 *
 * @returns {Object} Returns all users.
 */
exports.filterDelete = async (db, targetId, userId) => {
    if (targetId == userId || targetId == 1) {
        return false;
    }

    let user = db.User.findByPk(userId);
    let isRoot = await user.isRoot();
    if (!isRoot) {
        return false;
    }

    return true;
};

/**
 * Filters users who can create groups.
 *
 * @function filterAddGroups
 *
 * @param {obj} db - The database.
 * @param {Array} groupsId - The id of all groups.
 * @param {INTEGER} userId - The id of the user.
 *
 * @returns {Promise} An array containing groups to which the user belongs.
 */
exports.filterAddGroup = async (db, groupId, targetId, userId) => {

    const user = await db.User.findByPk(userId);
    if (user && await user.isRoot()) {
        return true;
    }

    return false

};

/**
 * Filters users who can delete a user from a group.
 *
 * @function filterDeleteGroups
 *
 * @param {obj} db - The database.
 * @param {Array} groupsId - The id of all groups.
 * @param {INTEGER} targetId - The id of the user that the user wants to delete from a group.
 * @param {INTEGER} userId - The id of the user.
 *
 * @returns {Promise} A user can delete himself from a group but only root can delete other users from groups.
 */
exports.filterDeleteGroup = async (db, groupId, targetId, userId) => {
    if (targetId === userId) {
        return true;
    }

    const user = await db.User.findByPk(userId);
    if (user && await user.isRoot()) {
        return true;
    }


    return false;


};
