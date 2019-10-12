'use strict';


exports.filterIndex = async (transaction, users) => users;

exports.filterShow = async (transaction, user) => user;

exports.filterStore = async (transaction, userId) => true;

exports.filterUpdate = async (transaction, targetId, userId) => true;

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

    if(groupId == 4) { // group : {name: 'default', id: 4}
        return false;
    }

    if (targetId === userId) {
        return true;
    }

    if (transaction.isAuthorized()) {
        return true;
    }


    return false;


};
