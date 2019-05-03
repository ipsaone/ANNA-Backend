'use strict';


exports.filterIndex = async (transaction, users, userId) => {
    const db = transaction.db;

    return users.map((thisUser) => {
        let user = {};

        if (thisUser instanceof db.User) {
            user = thisUser.toJSON();
        } else {
            // Else, assume it's already JSON !
            user = thisUser;
        }

        delete user.password;
        if (user.id !== userId) {
            delete user.email;
        }

        return user;
    });
};

exports.filterShow = async (transaction, thisUser, userId) => {
    
    const db = transaction.db;

    let user = {};

    if (thisUser instanceof db.User) {
        user = thisUser.toJSON();
    } else if (thisUser) {
        // Else, assume it's already JSON !
        user = thisUser;
    } else {
        return {};
    }

    delete user.password;
    if (user.id !== userId) {
        delete user.email;
    }

    return user;
};

exports.filterStore = async (transaction, userId) => {
    const db = transaction.db;
    
    let user = await db.User.findByPk(userId);
    let isRoot = await user.isRoot();
    if (!isRoot) {
        return false;
    }
    
    return true;
};

exports.filterUpdate = async (transaction, targetId, userId) =>{
    const db = transaction.db;

    let user = await db.User.findByPk(userId);
    let isRoot = await user.isRoot();
    if (!isRoot) {
        return false;
    }
    
    return true;
};;

exports.filterDelete = async (transaction, targetId, userId) => {
    const db = transaction.db;

    if (targetId == userId || targetId == 1) {
        return false;
    }

    let user = await db.User.findByPk(userId);
    let isRoot = await user.isRoot();
    if (!isRoot) {
        return false;
    }

    return true;
};

exports.filterAddGroup = async (transaction, groupId, targetId, userId) => {
    const db = transaction.db;


    const user = await db.User.findByPk(userId);
    if (user && await user.isRoot()) {
        return true;
    }

    return false

};

exports.filterDeleteGroup = async (transaction, groupId, targetId, userId) => {
    const db = transaction.db;

    if (targetId === userId) {
        return true;
    }

    const user = await db.User.findByPk(userId);
    if (user && await user.isRoot()) {
        return true;
    }


    return false;


};
