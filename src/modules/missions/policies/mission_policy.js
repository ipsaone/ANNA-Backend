'use strict';

const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');


exports.filterIndex = async (transaction) => {
    transaction.logger.info('Index mission always authorized');
    return true;
}


exports.filterShow = async (transaction) => {
    transaction.logger.info('Show mission always authorized');
    return true;
}


exports.filterStore = async (transaction, userId) => {
    transaction.logger.debug('Finding user');
    const user = await transaction.db.User.findByPk(userId);

    if (user && await user.isRoot()) {
        transaction.logger.info('Store mission authorized');
        return true;
    }

    transaction.logger.info('Store mission denied');
    return false;
};


exports.filterUpdate = async (transaction, userId) => {
    transaction.logger.debug('Finding user');
    const user = await transaction.db.User.findByPk(userId);

    
    if (user && await user.isRoot()) {
        transaction.logger.info("Update authorized");
        return true;
    }

    transaction.logger.info('Update denied');
    return false;
};


exports.filterDelete = async (transaction, userId) => {
    transaction.logger.debug('Finding user');
    const user = await transaction.db.User.findByPk(userId);

    if (user && await user.isRoot()) {
        transaction.logger.info('Deletion authorized');
        return true;
    }

    transaction.logger.info('Deletion denied');
    return false;
};

