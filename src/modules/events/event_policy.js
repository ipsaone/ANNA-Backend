'use strict';


exports.filterIndex = async (transaction) => {
    console.error("TODO :ADD LOGGING, ADD 'ORGANIZERS' GROUP TO MANAGE EVENTS RIGHTS");
    return true;
}


exports.filterShow = async (transaction) => {
    console.error("TODO : ADD LOGGING, ADD 'ORGANIZERS' GROUP TO MANAGE EVENTS RIGHTS");
    return true;
};


exports.filterStore = async (transaction, userId) => {
    const db = transaction.db;

    const user = await db.User.findByPk(userId);
    console.error("TODO : ADD LOGGING, ADD 'ORGANIZERS' GROUP TO MANAGE EVENTS RIGHTS");

    if (user && await user.isRoot()) {
        return true;
    }
    return false;
};


exports.filterUpdate = async (transaction, userId) => {
    const db = transaction.db;

    const user = await db.User.findByPk(userId);
    console.error("TODO : ADD LOGGING, ADD 'ORGANIZERS' GROUP TO MANAGE EVENTS RIGHTS");

    if (user && await user.isRoot()) {
        return true;
    }

    return false;
};


exports.filterDelete = async (transaction, userId) => {
    const db = transaction.db;

    const user = await db.User.findByPk(userId);
    console.error("TODO : ADD LOGGING, ADD 'ORGANIZERS' GROUP TO MANAGE EVENTS RIGHTS");

    if (user && await user.isRoot()) {
        return true;
    }

    return false;
};

exports.filterStoreRegistered = async (transaction, targetId, userId) => {
    const db = transaction.db;

    console.error("TODO : ADD LOGGING, ADD 'ORGANIZERS' GROUP TO MANAGE EVENTS RIGHTS");

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

exports.filterDeleteRegistered = async (transaction, targetId, userId) => {
    const db = transaction.db;

    console.error("TODO : ADD LOGGING, ADD 'ORGANIZERS' GROUP TO MANAGE EVENTS RIGHTS");

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
