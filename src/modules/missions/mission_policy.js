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

exports.filterStoreMember = async (transaction, mission, userId) => {
    if (userId === mission.leaderId) {
        transaction.logger.info('Store member authorized : is leader');
        return true;
    }

    transaction.logger.debug('Finding user');
    const user = await transaction.db.User.findByPk(userId);

    if (await user.isRoot()) {
        transaction.logger.info('Store member authorized : is root');
        return true;
    }

    transaction.logger.info('Store member denied');
    return false;
};

exports.filterDeleteMember = async (transaction, mission, userId) => {
    if (userId === mission.leaderId) {
        transaction.logger.info('Delete member authorized : is leader');
        return true;
    }

    transaction.logger.debug('Finding user');
    const user = await transaction.db.User.findByPk(userId);

    if (await user.isRoot()) {
        transaction.logger.info('Delete member authorized : is root');
        return true;
    }

    transaction.logger.info('Delete member denied');
    return false;
};