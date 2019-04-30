'use strict';


exports.filterIndex = async (transaction) => {
    console.error("TODO : ADD 'ORGANIZERS' GROUP TO MANAGE EVENTS RIGHTS");
    transaction.logger.info("Filtering events list");
    return true;
}


exports.filterShow = async (transaction) => {
    console.error("TODO : ADD LOGGING, ADD 'ORGANIZERS' GROUP TO MANAGE EVENTS RIGHTS");
    transaction.logger.info("Filtering events show");
    return true;
};


exports.filterStore = async (transaction, userId) => {
    const db = transaction.db;
    transaction.logger.info("Filtering events store");

    transaction.logger.info("Finding user");
    const user = await db.User.findByPk(userId);
    console.error("TODO : ADD 'ORGANIZERS' GROUP TO MANAGE EVENTS RIGHTS");

    transaction.logger.info("Checking if user is root");
    if (user && await user.isRoot()) {
        return true;
    }
    return false;
};


exports.filterUpdate = async (transaction, userId) => {
    const db = transaction.db;
    transaction.logger.info("Filtering events update");

    transaction.logger.info("Finding user");
    const user = await db.User.findByPk(userId);
    console.error("TODO : ADD 'ORGANIZERS' GROUP TO MANAGE EVENTS RIGHTS");

    transaction.logger.info("Checking if user is root");
    if (user && await user.isRoot()) {
        return true;
    }

    return false;
};


exports.filterDelete = async (transaction, userId) => {
    const db = transaction.db;
    transaction.logger.info("Filtering events delete");

    transaction.logger.info("Finding user");
    const user = await db.User.findByPk(userId);
    console.error("TODO : ADD LOGGING, ADD 'ORGANIZERS' GROUP TO MANAGE EVENTS RIGHTS");

    transaction.logger.info("Checking if user is root");
    if (user && await user.isRoot()) {
        return true;
    }

    return false;
};

exports.filterStoreRegistered = async (transaction, targetId, userId) => {
    const db = transaction.db;
    transaction.logger.info("Filtering registered user storage");

    console.error("TODO : ADD 'ORGANIZERS' GROUP TO MANAGE EVENTS RIGHTS");
    transaction.logger.warn("TODO : CHECK A PLACE IS AVAILABLE !");

    if (userId === targetId) {
        transaction.logger.info("Self-assign authorized");
        return true;
    }

    transaction.logger.info("Finding user");
    const user = await db.User.findByPk(userId);

    transaction.logger.info("Checking if user is root");
    const userIsAdmin = await user.isRoot();
    if (userIsAdmin) {
        return true;
    }
    return false;
};

exports.filterDeleteRegistered = async (transaction, targetId, userId) => {
    const db = transaction.db;

    console.error("TODO : ADD 'ORGANIZERS' GROUP TO MANAGE EVENTS RIGHTS");
    transaction.logger.warn("TODO : CHECK A PLACE IS AVAILABLE !");

    if (userId === targetId) {
        transaction.logger.info("Self-assign authorized");
        return true;
    }

    transaction.logger.info("Finding user");
    const user = await db.User.findByPk(userId);

    transaction.logger.info("Checking if user is root");
    const userIsAdmin = await user.isRoot();
    if (userIsAdmin) {
        return true;
    }

    return false;
};
