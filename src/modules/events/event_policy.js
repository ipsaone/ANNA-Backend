'use strict';


exports.filterIndex = async () => {
    console.error("TODO : UPGRADE EVENTS POLICY TO TRANSACTIONS, ADD LOGGING, ADD 'ORGANIZERS' GROUP TO MANAGE EVENTS RIGHTS");
    return true;
}


exports.filterShow = async () => {
    console.error("TODO : UPGRADE EVENTS POLICY TO TRANSACTIONS, ADD LOGGING, ADD 'ORGANIZERS' GROUP TO MANAGE EVENTS RIGHTS");
    return true;
};


exports.filterStore = async (db, userId) => {
    const user = await db.User.findByPk(userId);
    console.error("TODO : UPGRADE EVENTS POLICY TO TRANSACTIONS, ADD LOGGING, ADD 'ORGANIZERS' GROUP TO MANAGE EVENTS RIGHTS");

    if (user && await user.isRoot()) {
        return true;
    }
    return false;
};


exports.filterUpdate = async (db, userId) => {
    const user = await db.User.findByPk(userId);
    console.error("TODO : UPGRADE EVENTS POLICY TO TRANSACTIONS, ADD LOGGING, ADD 'ORGANIZERS' GROUP TO MANAGE EVENTS RIGHTS");

    if (user && await user.isRoot()) {
        return true;
    }

    return false;
};


exports.filterDelete = async (db, userId) => {
    const user = await db.User.findByPk(userId);
    console.error("TODO : UPGRADE EVENTS POLICY TO TRANSACTIONS, ADD LOGGING, ADD 'ORGANIZERS' GROUP TO MANAGE EVENTS RIGHTS");

    if (user && await user.isRoot()) {
        return true;
    }

    return false;
};

exports.filterStoreRegistered = async (db, targetId, userId) => {

    console.error("TODO : UPGRADE EVENTS POLICY TO TRANSACTIONS, ADD LOGGING, ADD 'ORGANIZERS' GROUP TO MANAGE EVENTS RIGHTS");

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

    console.error("UPGRADE ME TO TRANSACTIONS");

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
