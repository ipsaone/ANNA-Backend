'use strict';


exports.filterIndex = () => Promise.resolve(true);


exports.filterShow = () => Promise.resolve(true);


exports.filterStore = async (db, userId) => {
    const user = await db.User.findByPk(userId);

    if (user && await user.isRoot()) {
        return true;
    }
    return false;
};


exports.filterUpdate = async (db, userId) => {
    const user = await db.User.findByPk(userId);

    if (user && await user.isRoot()) {
        return true;
    }

    return false;
};


exports.filterDelete = async (db, userId) => {
    const user = await db.User.findByPk(userId);

    if (user && await user.isRoot()) {
        return true;
    }

    return false;
};

exports.filterStoreRegistered = async (db, targetId, userId) => {

    if (userId === targetId) {
        return true;
    }

    const user = await db.User.findByPk(userId);
    const userIsAdmin = await user.isRoot();

    if (userIsAdmin) {
        return true;
    }

    return false;
};

exports.filterDeleteRegistered = async (db, targetId, userId) => {

    if (userId === targetId) {
        return true;
    }

    const user = await db.User.findByPk(userId);
    const userIsAdmin = await user.isRoot();

    if (userIsAdmin) {
        return true;
    }

    return false;
};
