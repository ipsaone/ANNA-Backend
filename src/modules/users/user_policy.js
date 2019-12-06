'use strict';


exports.filterIndex = async (transaction, users) => users;

exports.filterShow = async (transaction, user) => user;

exports.filterStore = async () => true;

exports.filterUpdate = async () => true;

exports.filterDelete = async (transaction, targetId, userId) => {
    if (targetId == userId || targetId == 1) {
        return false;
    }
    return true;
};

exports.filterIndexPosts = async() => true;

exports.filterAddGroup = async (transaction, groupId, targetId, userId) => true;

exports.filterDeleteGroup = async (transaction, groupId, targetId, userId) => {
    const db = transaction.db;

    
    let group = await transaction.db.Group.findByPk(groupId);
    if(group.name === "default")  {
        return false;
    }

    if (targetId === userId) {
        return true;
    }

    
    if (transaction.info.isAuthorized) {
        return true;
    }


    return false;


};
