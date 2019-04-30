'use strict';


exports.filterIndex = async (transaction) => {
    transaction.logger.info("Filtering events list");
    return true;
}


exports.filterShow = async (transaction) => {
    transaction.logger.info("Filtering events show");
    return true;
};


exports.filterStore = async (transaction, userId) => {
    const db = transaction.db;
    transaction.logger.info("Filtering events store");

    transaction.logger.info("Finding user");
    const user = await db.User.findByPk(userId);

    transaction.logger.info("Checking if user is root");
    if (user && await user.isRoot()) {
        return true;
    }

    transaction.logger.info("Checking if user is organizer");
    const groups = await user.getGroups();
    if(groups.includes('organizers')) {
        return true;
    }

    return false;
};


exports.filterUpdate = async (transaction, userId) => {
    const db = transaction.db;
    transaction.logger.info("Filtering events update");

    transaction.logger.info("Finding user");
    const user = await db.User.findByPk(userId);

    transaction.logger.info("Checking if user is root");
    if (user && await user.isRoot()) {
        return true;
    }
    
    transaction.logger.info("Checking if user is organizer");
    const groups = await user.getGroups();
    if(groups.includes('organizers')) {
        return true;
    }

    return false;
};


exports.filterDelete = async (transaction, userId) => {
    const db = transaction.db;
    transaction.logger.info("Filtering events delete");

    transaction.logger.info("Finding user");
    const user = await db.User.findByPk(userId);

    transaction.logger.info("Checking if user is root");
    if (user && await user.isRoot()) {
        return true;
    }
    
    transaction.logger.info("Checking if user is organizer");
    const groups = await user.getGroups();
    if(groups.includes('organizers')) {
        return true;
    }


    return false;
};

exports.filterStoreRegistered = async (transaction, targetId, userId) => {
    const db = transaction.db;
    transaction.logger.info("Filtering registered user storage");

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

    transaction.logger.info("Checking if user is organizer");
    const groups = await user.getGroups();
    if(groups.includes('organizers')) {
        return true;
    }

    return false;
};

exports.filterDeleteRegistered = async (transaction, targetId, userId) => {
    const db = transaction.db;

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

    transaction.logger.info("Checking if user is organizer");
    const groups = await user.getGroups();
    if(groups.includes('organizers')) {
        return true;
    }


    return false;
};
