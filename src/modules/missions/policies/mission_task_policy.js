'use strict';

exports.filterIndexTasks = (transaction) => {
    transaction.logger.info('Tasks index always authorized');
    return true;
}

exports.filterShowTask = (transaction) => {
    transaction.logger.info('Tasks show always authorized');
    return true;
}

exports.filterStoreTask = async (transaction, mission, userId) => {

    if (userId === mission.leaderId) {
        transaction.logger.debug('Store task allowed : is leader');
        return true;
    }

    transaction.logger.debug('Finding user');
    const user = await transaction.db.User.findByPk(userId);
    if (await user.isRoot()) {
        transaction.logger.info('Store task allowed : is root');
        return true;
    }

    transaction.logger.info('Store task denied');
    return false;
};

exports.filterUpdateTask = async (transaction, contents, mission, userId) => {

    if (userId === mission.leaderId) {
        transaction.logger.info('Update task allowed : is leader');
        return contents;
    }

    transaction.logger.debug('Finding user');
    const user = await transaction.db.User.findByPk(userId);

    
    if (await user.isRoot()) {
        transaction.logger.info('Update task allowed : is root');
        return contents;
    }

    transaction.logger.info('Update task denied');
    return [];
};

exports.filterDeleteTask = async (transaction, mission, userId) => {

    if (userId === mission.leaderId) {
        transaction.logger.info('Delete task authorized : is leader');
        return true;
    }

    transaction.logger.debug('Finding user');
    const user = await transaction.db.User.findByPk(userId);

    if (await user.isRoot()) {
        transaction.logger.info('Delete task authorized : is root');
        return true;
    }

    transaction.logger.info('Delete task denied');
    return false;
};
