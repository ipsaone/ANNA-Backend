'use strict';


exports.filterIndex = async (transaction) => true;


exports.filterShow = async (transaction) => true;


exports.filterStore = async (transaction, userId) => true;


exports.filterUpdate = async (transaction) => true;


exports.filterDelete = async (transaction, userId) => true;

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
