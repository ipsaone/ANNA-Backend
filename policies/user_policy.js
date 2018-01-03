'use strict';

const db = require('../models');

exports.filterIndex = (users, userId) => Promise.resolve(users)
    .then((us) => us.map((u) => {
        let user = {};

        if (u instanceof db.User) {
            user = u.toJSON();
        } else {
            // Else, assume it's already JSON !
            user = u;
        }

        delete user.password;
        if (user.id !== userId) {
            delete user.email;
        }

        return user;
    }));

exports.filterShow = (us, userId) => Promise.resolve(us)
    .then((u) => {
        let user = {};

        if (u instanceof db.User) {
            user = u.toJSON();
        } else {
            // Else, assume it's already JSON !
            user = u;
        }

        delete user.password;
        if (user.id !== userId) {
            delete user.email;
        }

        return user;
    });

exports.filterStore = (user) => Promise.resolve(user);

exports.filterDelete = (user) => Promise.resolve(user);

exports.filterAddGroups = async (groupsId, userId) => {
    const user = await db.User.findById(userId);

    if (user && await user.isRoot()) {
        return groupsId;
    }

    const groups = await user.getGroups();


    return groups.map((group) => group.id).filter((group) => groups.includes(group));

};

exports.filterDeleteGroups = async (groupsId, targetId, userId) => {
    if (targetId === userId) {
        return groupsId;
    }
    const user = await db.User.findById(userId);

    if (user && await user.isRoot()) {
        return groupsId;
    }


    throw new Error('Unauthorized');


};
