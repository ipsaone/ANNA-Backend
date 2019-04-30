'use strict';

exports.filterList = async (transaction) => {
    return true;
};

exports.filterShow = async (transaction) => {
    return true;
};

exports.filterStore = async (transaction) => {
    transaction.logger.info("Filtering group store");
    const db = transaction.db;

    transaction.logger.info("Finding user");
    const user = await db.User.findByPk(transaction.info.userId);

    transaction.logger.info("Checking if user is root");
    if (user && await user.isRoot()) {
        return true;
    }
    return false;
};

exports.filterUpdate = async (transaction) => {
    transaction.logger.info("Filtering group update");
    const db = transaction.db;

    transaction.logger.info("Finding user");
    const user = await db.User.findByPk(transaction.info.userId);

    transaction.logger.info("Checking if user is root");
    if (user && await user.isRoot()) {
        return true;
    }
    return false;
};

exports.filterDelete = async (transaction) => {
    transaction.logger.info("Filtering group delete");
    const db = transaction.db;

    transaction.logger.info("Finding user");
    const user = await db.User.findByPk(transaction.info.userId);

    transaction.logger.info("Checking if user is root");
    if (user && await user.isRoot()) {
        return true;
    }
    return false;
}