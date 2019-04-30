
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