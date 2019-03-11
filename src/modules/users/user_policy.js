'use strict';


exports.filterIndex = (db, users, userId) => Promise.resolve(users)
    .then((us) => us.map((thisUser) => {
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
    }));

exports.filterShow = (db, us, userId) => Promise.resolve(us)
    .then((thisUser) => {
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
    });

exports.filterStore = (db, user) => async (db, userId) => {
    let user = db.User.findByPk(userId);
    let isRoot = await user.isRoot();
    if (!isRoot) {
        return false;
    }
    
    return true;
};

exports.filterUpdate = (db, targetId, userId) => async (db, targetId, userId) => {
    let user = db.User.findByPk(userId);
    let isRoot = await user.isRoot();
    if (!isRoot) {
        return false;
    }
    
    return true;
};;

exports.filterDelete = async (db, targetId, userId) => {
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

exports.filterAddGroup = async (db, groupId, targetId, userId) => {

    const user = await db.User.findByPk(userId);
    if (user && await user.isRoot()) {
        return true;
    }

    return false

};

exports.filterDeleteGroup = async (db, groupId, targetId, userId) => {
    if (targetId === userId) {
        return true;
    }

    const user = await db.User.findByPk(userId);
    if (user && await user.isRoot()) {
        return true;
    }


    return false;


};
