
exports.filterStoreMember = async (transaction, mission, userId) => {
    if (userId === mission.leaderId  || transaction.info.isAuthorized) {
        transaction.logger.info('Store member authorized');
        return true;
    }

    transaction.logger.info('Store member denied');
    return false;
};

exports.filterDeleteMember = async (transaction, mission, userId) => {
    if (userId === mission.leaderId  || transaction.info.isAuthorized) {
        transaction.logger.info('Delete member authorized');
        return true;
    }

    transaction.logger.info('Delete member denied');
    return false;
};