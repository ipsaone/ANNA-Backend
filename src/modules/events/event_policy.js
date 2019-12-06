'use strict';


exports.filterIndex = async () => true;


exports.filterShow = async () => true;


exports.filterStore = async () => true;


exports.filterUpdate = async () => true;


exports.filterDelete = async () => true;

exports.filterStoreRegistered = async (transaction, targetId, userId) => {
    const db = transaction.db;
    transaction.logger.info("Filtering registered user storage");

    if (userId === targetId) {
        transaction.logger.info("Self-assign authorized");
        return true;
    }

    if(transaction.info.isAuthorized) {
        return true;
    }

    return false;
};

exports.filterDeleteRegistered = async (transaction, targetId, userId) => {
    const db = transaction.db;

    if (userId === targetId) {
        transaction.logger.info("Self-assign authorized");
        return true;
    }

    if(transaction.info.isAuthorized) {
        return true;
    }


    return false;
};
