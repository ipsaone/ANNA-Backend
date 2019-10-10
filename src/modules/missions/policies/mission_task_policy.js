'use strict';

exports.filterStoreTask = async (transaction, mission, userId) => {

    if (userId === mission.leaderId || transaction.info.isAuthorized) {
        transaction.logger.debug('Store task allowed');
        return true;
    }
    transaction.logger.info('Store task denied');
    return false;
};

exports.filterUpdateTask = async (transaction, contents, mission, userId) => {

    if (userId === mission.leaderId  || transaction.info.isAuthorized) {
        transaction.logger.info('Update task allowed');
        return contents;
    }

    transaction.logger.info('Update task denied');
    return [];
};

exports.filterDeleteTask = async (transaction, mission, userId) => {

    if (userId === mission.leaderId  || transaction.info.isAuthorized) {
        transaction.logger.info('Delete task authorized');
        return true;
    }

    transaction.logger.info('Delete task denied');
    return false;
};
