'use strict';

const db = require('../models');

const userIsRoot = (userId) => db.User.findOne({
    where: {id: userId},
    include: ['groups']
})
    .then((user) => {
        if (user && user.groups) {
            return user.groups;
        }

        return [];

    })

    // No case checking needed, they are stored lowercase
    .then((groups) => groups.find((group) => group.name === 'root'))

    // Return an error or the group
    .then((group) => typeof group !== 'undefined');

exports.filterIndex = (users, userId) => Promise.resolve(users)
    .then((us) => us.map((u) => {
        const user = u.toJSON();

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

exports.filterAddGroups = (groupsId, userId) =>
    userIsRoot(userId)
        .then((isRoot) => {
            if (isRoot) {
                return groupsId;
            }

            return db.User.findById(userId)
                .then((user) => user.getGroups)
                .then((groups) => groups.map((group) => group.id))
                .then((groups) => groupsId.filter((group) => groups.includes(group)));

        });

exports.filterDeleteGroups = (groupsId, targetId, userId) =>
    userIsRoot(userId)
        .then((isRoot) => {
            if (isRoot || targetId === userId) {
                return groupsId;
            }
            throw new Error('Unauthorized');


        });
