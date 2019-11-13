exports.filterUpdate = async (transaction, mission, userId) => {
    if(!transaction.info.isAuthorized && mission.leaderId !== userId) {
        return false;
    }

    return true;
}